// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FoodSupplyChain {
    struct Product {
        string name;
        string origin;
        string category;
        string status;
        address owner;
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount;

    event ProductAdded(uint256 productId, string name, string origin, string category, address owner);
    event ProductUpdated(uint256 productId, string status, address owner);

    function addProduct(string memory _name, string memory _origin, string memory _category) public {
        productCount++;
        products[productCount] = Product(_name, _origin, _category, "Created", msg.sender);
        emit ProductAdded(productCount, _name, _origin, _category, msg.sender);
    }

    function updateProduct(uint256 _productId, string memory _status) public {
        require(products[_productId].owner == msg.sender, "Not authorized");
        products[_productId].status = _status;
        emit ProductUpdated(_productId, _status, msg.sender);
    }

    function getProduct(uint256 _productId) public view returns (string memory, string memory, string memory, string memory, address) {
        Product memory p = products[_productId];
        return (p.name, p.origin, p.category, p.status, p.owner);
    }
}
