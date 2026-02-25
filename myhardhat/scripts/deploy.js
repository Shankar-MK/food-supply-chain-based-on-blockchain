const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FoodSupplyChain contract...");

  // Get the ContractFactory and Signers here.
  const FoodSupplyChain = await ethers.getContractFactory("FoodSupplyChain");
  
  // Deploy the contract
  const foodSupplyChain = await FoodSupplyChain.deploy();
  
  // Wait for the contract to be deployed
  await foodSupplyChain.waitForDeployment();
  
  const contractAddress = await foodSupplyChain.getAddress();
  console.log("FoodSupplyChain deployed to:", contractAddress);
  
  // Save the contract address to a file for the backend to use
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    abi: FoodSupplyChain.interface.format('json')
  };
  
  fs.writeFileSync(
    '../backend/contract-info.json',
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("Contract info saved to backend/contract-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

