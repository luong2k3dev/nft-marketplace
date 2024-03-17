const fs = require("fs");
const { execSync } = require("child_process");

async function verifyContracts() {
  try {
    const contractInfo = JSON.parse(fs.readFileSync("./contract.json", "utf-8"));

    await verifyContract("MyERC20Token", contractInfo.erc20Token.address, ...contractInfo.erc20Token.arguments);

    await verifyContract("MyERC721Token", contractInfo.erc721Token.address, ...contractInfo.erc721Token.arguments);

    await verifyContract("MyERC1155Token", contractInfo.erc1155Token.address, ...contractInfo.erc1155Token.arguments);

    await verifyContract("TokenSale", contractInfo.tokenSale.address, ...contractInfo.tokenSale.arguments);

    await verifyContract("NFTMarketplace", contractInfo.nftMarketplace.address, ...contractInfo.nftMarketplace.arguments);

    console.log("All contracts verified successfully!");
  } catch (error) {
    console.error("Error verifying contracts:", error);
    process.exitCode = 1;
  }
}

async function verifyContract(contractName, contractAddress, ...contractArgs) {
  try {
    console.log(`Verifying ${contractName} at ${contractAddress} on the network...`);
    const argsString = contractArgs.join(" ");
    execSync(`npx hardhat verify --network mumbai ${contractAddress} ${argsString}`, {
      stdio: "inherit",
    });
    console.log(`${contractName} verification successful!`);
  } catch (error) {
    console.error(`${contractName} verification failed:`, error);
    throw error;
  }
}

verifyContracts();
