async function getProduct() {
    const productId = document.getElementById("productId").value;
    const response = await fetch(`http://localhost:5000/getProduct/${productId}`);
    const data = await response.json();

    if (data.success) {
        console.log(data.product);
        const productData = JSON.stringify(data.product); // Get product data as a string
        
        // Generate QR code for the product data
        const qrCodeContainer = document.getElementById("qrCodeContainer");
        qrCodeContainer.innerHTML = ""; // Clear previous QR code
        QRCode.toCanvas(qrCodeContainer, productData, function (error) {
            if (error) console.error(error);
            console.log("QR code generated!");
        });
    } else {
        alert("Product not found");
    }
}
async function getProductDetails() {
    const productId = document.getElementById("productId").value;
    const response = await fetch(`http://localhost:5000/getProduct/${productId}`);
    
    if (response.ok) {
        const product = await response.json();
        // Display the product details on the webpage
        document.getElementById("productDetails").innerHTML = `
            <p><strong>Name:</strong> ${product.name}</p>
            <p><strong>Origin:</strong> ${product.origin}</p>
            <p><strong>Category:</strong> ${product.category}</p>
        `;
    } else {
        console.error("Error fetching product data");
    }
}
