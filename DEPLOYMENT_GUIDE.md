# FoodChain Tracker - Blockchain Supply Chain Solution

## 🎉 Deployment Guide

This document provides comprehensive instructions for deploying and running the complete blockchain supply chain tracking solution.

## 📋 Project Overview

The FoodChain Tracker is a complete blockchain-based supply chain tracking system that includes:

- **Smart Contract**: Solidity contract deployed on Hardhat local network
- **Backend API**: Node.js/Express server with SQLite database
- **Frontend Interface**: HTML/CSS/JavaScript with blockchain visualization
- **Analytics Dashboard**: Real-time blockchain monitoring and charts

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (HTML/JS)     │◄──►│   (Node.js)     │◄──►│   (Hardhat)     │
│                 │    │                 │    │                 │
│ • Product UI    │    │ • REST API      │    │ • Smart Contract│
│ • Dashboard     │    │ • Database      │    │ • Local Network │
│ • Analytics     │    │ • QR Codes      │    │ • Transactions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### 1. Start Blockchain Network

```bash
cd myhardhat
npm install
npx hardhat node
```

Keep this terminal running. The network will be available at `http://127.0.0.1:8545`

### 2. Deploy Smart Contract

In a new terminal:
```bash
cd myhardhat
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Start Backend Server

In a new terminal:
```bash
cd backend
npm install
npm start
```

Backend will be available at `http://localhost:5000`

### 4. Access Frontend

Open any of these files in your browser:
- `frontend/index.html` - Main landing page
- `frontend/product.html` - Product tracking interface
- `frontend/dashboard.html` - Analytics dashboard

## 📁 Project Structure

```
myproject/
├── myhardhat/                 # Blockchain & Smart Contracts
│   ├── contracts/
│   │   └── mycontract.sol     # Supply chain smart contract
│   ├── scripts/
│   │   └── deploy.js          # Deployment script
│   ├── hardhat.config.js      # Hardhat configuration
│   └── package.json
├── backend/                   # Backend API Server
│   ├── server.js              # Main server file
│   ├── contract-info.json     # Contract ABI and address
│   ├── .env                   # Environment variables
│   └── package.json
└── frontend/                  # Frontend Interface
    ├── index.html             # Main landing page
    ├── product.html           # Product tracking UI
    └── dashboard.html         # Analytics dashboard
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://127.0.0.1:8545
PORT=5000
```

**Hardhat (.env)**:
```
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
```

## 🎯 Features Implemented

### ✅ Smart Contract Features
- Product registration with metadata
- Supply chain event tracking
- Immutable transaction history
- Event emission for frontend integration

### ✅ Backend Features
- RESTful API endpoints
- SQLite database integration
- QR code generation
- Supply chain event logging
- CORS enabled for frontend access

### ✅ Frontend Features
- Product registration form
- Supply chain stage tracking
- Product details retrieval
- QR code display
- Supply chain history visualization

### ✅ Dashboard Features
- Real-time blockchain statistics
- Transaction timeline charts
- Product category analytics
- Supply chain flow visualization
- Network status monitoring

## 🔍 API Endpoints

### Product Management
- `POST /api/products` - Add new product
- `GET /api/products/:id` - Get product details

### Supply Chain Tracking
- `POST /api/supply-chain` - Add supply chain event
- `GET /api/supply-chain/:productId` - Get supply chain history

### Analytics
- `GET /api/stats` - Get blockchain statistics

## 🧪 Testing

### Test Product Creation
1. Open `frontend/product.html`
2. Fill in product details:
   - Name: "Organic Apples"
   - Origin: "Washington State Farm"
   - Category: "Fresh Fruit"
3. Click Submit
4. Note the generated Product ID and QR code

### Test Supply Chain Tracking
1. Click on "Transportation" tab
2. Enter the Product ID from previous step
3. Fill in transportation details
4. Click Submit
5. View updated supply chain history

### Test Analytics Dashboard
1. Open `frontend/dashboard.html`
2. View real-time blockchain statistics
3. Check transaction history
4. Monitor supply chain flow

## 🛠️ Troubleshooting

### Common Issues

**Blockchain Connection Failed**
- Ensure Hardhat node is running on port 8545
- Check if contract is deployed correctly
- Verify environment variables

**Backend API Errors**
- Check if backend server is running on port 5000
- Verify database file permissions
- Check contract address in environment

**Frontend CORS Issues**
- Serve frontend through a local server instead of file://
- Ensure backend CORS is properly configured

### Network Configuration

The system is configured for local development with:
- Hardhat Network: `http://127.0.0.1:8545`
- Backend API: `http://localhost:5000`
- Frontend: File-based or local server

## 📊 Database Schema

### Products Table
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    origin TEXT,
    category TEXT,
    blockchain_id INTEGER,
    qr_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Supply Chain Events Table
```sql
CREATE TABLE supply_chain_events (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    event_type TEXT,
    description TEXT,
    location TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
);
```

## 🔐 Security Considerations

- Private keys are for development only
- Database is local SQLite (not production-ready)
- No authentication implemented (development mode)
- CORS is open for all origins (development mode)

## 🚀 Production Deployment

For production deployment, consider:
1. Use a production blockchain network (Ethereum, Polygon, etc.)
2. Implement proper authentication and authorization
3. Use a production database (PostgreSQL, MongoDB)
4. Configure proper CORS policies
5. Use environment-specific configuration
6. Implement proper error handling and logging

## 📞 Support

If you encounter any issues:
1. Check the console logs in browser developer tools
2. Verify all services are running
3. Check network connectivity
4. Review environment variable configuration

## 🎉 Success Indicators

The system is working correctly when:
- ✅ Hardhat node shows "Started HTTP and WebSocket JSON-RPC server"
- ✅ Backend shows "Server running on port 5000"
- ✅ Frontend can add products and generate QR codes
- ✅ Dashboard displays real-time blockchain data
- ✅ Supply chain events are tracked and stored

---

**Congratulations! Your blockchain supply chain tracking system is now fully operational! 🎉**

