require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const QRCode = require("qrcode");
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'supply_chain.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        blockchain_id INTEGER,
        name TEXT,
        origin TEXT,
        category TEXT,
        status TEXT,
        owner_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS supply_chain_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        event_type TEXT,
        description TEXT,
        location TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (blockchain_id)
    )`);
});

console.log("Database initialized successfully");

// Connect to the local Hardhat network
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');

// Wallet setup using private key from environment
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load contract info from file if it exists, otherwise use defaults
let contractAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let contractABI = [
    "function addProduct(string memory _name, string memory _origin, string memory _category) public",
    "function updateProduct(uint256 _productId, string memory _status) public",
    "function getProduct(uint256 _productId) public view returns (string memory, string memory, string memory, string memory, address)",
    "event ProductAdded(uint256 productId, string name, string origin, string category, address owner)",
    "event ProductUpdated(uint256 productId, string status, address owner)"
];

// Try to load contract info from deployment
try {
    const contractInfoPath = path.join(__dirname, 'contract-info.json');
    if (fs.existsSync(contractInfoPath)) {
        const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, 'utf8'));
        contractAddress = contractInfo.address;
        contractABI = JSON.parse(contractInfo.abi);
        console.log("Loaded contract info from file:", contractAddress);
    }
} catch (error) {
    console.log("Using default contract configuration");
}

// Create a contract instance
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Helper function to generate QR code
const generateQRCode = async (data) => {
    try {
        return await QRCode.toDataURL(data);
    } catch (error) {
        throw new Error("Error generating QR code: " + error.message);
    }
};

// Add Product
app.post("/addProduct", async (req, res) => {
    try {
        const { name, origin, category } = req.body;
        if (!name || !origin || !category) {
            return res.status(400).json({ success: false, error: "All fields are required!" });
        }

        console.log("Adding product...");
        
        const tx = await contract.addProduct(name, origin, category);
        const receipt = await tx.wait();

        console.log("Transaction receipt:", receipt);

        // Check if the receipt has logs
        if (!receipt.logs || receipt.logs.length === 0) {
            return res.status(500).json({ success: false, error: "No logs found in the receipt" });
        }

        // Find the event log for ProductAdded
        const event = receipt.logs.find(log => {
            try {
                const decodedLog = contract.interface.parseLog(log);
                console.log("Decoded log:", decodedLog);
                return decodedLog.name === 'ProductAdded';
            } catch (error) {
                console.error("Error decoding log:", error);
                return false;
            }
        });

        if (!event) {
            return res.status(500).json({ success: false, error: "ProductAdded event not found in logs" });
        }

        // Extract the productId from the event (first argument)
        const decodedEvent = contract.interface.parseLog(event);
        const productId = decodedEvent.args[0].toString();
        console.log("Product ID from event:", productId);

        const qrCodeImage = await generateQRCode(`http://localhost:3000/product/${productId}`);
        console.log("QR Code Image:", qrCodeImage); // Check if QR code is generated

        // Store product in database
        db.run(
            `INSERT INTO products (blockchain_id, name, origin, category, status, owner_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [productId, name, origin, category, "Created", wallet.address],
            function(err) {
                if (err) {
                    console.error("Database error:", err);
                } else {
                    console.log("Product stored in database with ID:", this.lastID);
                }
            }
        );

        // Add initial supply chain event
        db.run(
            `INSERT INTO supply_chain_events (product_id, event_type, description, location) 
             VALUES (?, ?, ?, ?)`,
            [productId, "Created", `Product ${name} created`, origin],
            function(err) {
                if (err) {
                    console.error("Database error:", err);
                } else {
                    console.log("Initial event stored in database");
                }
            }
        );

        res.json({
            success: true,
            message: "Product added successfully!",
            productId,
            qrCodeImage
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Product
app.get("/getProduct/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        // Validate productId is a number
        if (isNaN(productId)) {
            return res.status(400).json({ success: false, error: "Invalid product ID format" });
        }

        console.log("Getting product with ID:", productId);

        // Get product details from the smart contract
        const product = await contract.getProduct(productId);

        // Check if the product exists
        if (!product || !product[0]) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }

        console.log("Product details:", product);

        // Extract product details from the response
        const [name, origin, category, status, owner] = product;

        // Generate QR code for product details page
        const qrCodeImage = await generateQRCode(`http://localhost:3000/product/${productId}`);

        // Return the product details along with the QR code
        res.json({
            success: true,
            product: {
                productId,
                name,
                origin,
                category,
                status,
                owner,
            },
            qrCodeImage,
        });
    } catch (error) {
        console.error("Error getting product:", error);
        res.status(500).json({ success: false, error: "Failed to retrieve product" });
    }
});

// Add Supply Chain Event
app.post("/addEvent", async (req, res) => {
    try {
        const { productId, eventType, description, location } = req.body;
        
        if (!productId || !eventType || !description) {
            return res.status(400).json({ success: false, error: "Product ID, event type, and description are required!" });
        }

        db.run(
            `INSERT INTO supply_chain_events (product_id, event_type, description, location) 
             VALUES (?, ?, ?, ?)`,
            [productId, eventType, description, location || ""],
            function(err) {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ success: false, error: "Failed to add event" });
                }
                
                res.json({
                    success: true,
                    message: "Event added successfully",
                    eventId: this.lastID
                });
            }
        );
    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Supply Chain History
app.get("/getHistory/:productId", async (req, res) => {
    try {
        const productId = req.params.productId;

        db.all(
            `SELECT * FROM supply_chain_events WHERE product_id = ? ORDER BY timestamp ASC`,
            [productId],
            (err, rows) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ success: false, error: "Failed to retrieve history" });
                }
                
                res.json({
                    success: true,
                    history: rows
                });
            }
        );
    } catch (error) {
        console.error("Error getting history:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get All Products
app.get("/getAllProducts", async (req, res) => {
    try {
        db.all(
            `SELECT * FROM products ORDER BY created_at DESC`,
            [],
            (err, rows) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ success: false, error: "Failed to retrieve products" });
                }
                
                res.json({
                    success: true,
                    products: rows
                });
            }
        );
    } catch (error) {
        console.error("Error getting products:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Product Status
app.post("/updateStatus", async (req, res) => {
    try {
        const { productId, status, description, location } = req.body;
        
        if (!productId || !status) {
            return res.status(400).json({ success: false, error: "Product ID and status are required!" });
        }

        // Update on blockchain
        const tx = await contract.updateProduct(productId, status);
        await tx.wait();

        // Update in database
        db.run(
            `UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE blockchain_id = ?`,
            [status, productId],
            function(err) {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ success: false, error: "Failed to update status" });
                }
            }
        );

        // Add event
        db.run(
            `INSERT INTO supply_chain_events (product_id, event_type, description, location) 
             VALUES (?, ?, ?, ?)`,
            [productId, "Status Update", description || `Status updated to ${status}`, location || ""],
            function(err) {
                if (err) {
                    console.error("Database error:", err);
                }
            }
        );

        res.json({
            success: true,
            message: "Status updated successfully"
        });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Define your server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
