require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables

module.exports = {
    solidity: "0.8.19",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",  // Load from .env
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        }
    }
};
