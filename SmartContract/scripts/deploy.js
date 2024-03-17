const { ethers } = require("hardhat");
const fs = require("fs");

const erc20TokenJson = require("../artifacts/contracts/TokenERC20.sol/MyERC20Token.json");
const erc721TokenJson = require("../artifacts/contracts/TokenERC721.sol/MyERC721Token.json");
const erc1155TokenJson = require("../artifacts/contracts/TokenERC1155.sol/MyERC1155Token.json");
const tokenSaleJson = require("../artifacts/contracts/TokenSale.sol/TokenSale.json");
const nftMarketplaceJson = require("../artifacts/contracts/Market.sol/NFTMarketplace.json");

async function deployContracts() {
  console.log("Contracts are deploying...");

  const totalSupplyErc20 = 1000; // 1000 token
  const listingFees = 1000000000000000; // 0.1 ETH

  const erc20Token = await deploy("MyERC20Token", [totalSupplyErc20]);
  const erc721Token = await deploy("MyERC721Token", []);
  const erc1155Token = await deploy("MyERC1155Token", []);

  const erc20TokenAddress = await erc20Token.getAddress();
  const erc721TokenAddress = await erc721Token.getAddress();
  const erc1155TokenAddress = await erc1155Token.getAddress();

  const tokenSale = await deploy("TokenSale", [erc20TokenAddress]);
  const nftMarketplace = await deploy("NFTMarketplace", [
    erc20TokenAddress,
    erc721TokenAddress,
    erc1155TokenAddress,
    listingFees,
  ]);

  const tokenSaleAddress = await tokenSale.getAddress();
  const nftMarketplaceAddress = await nftMarketplace.getAddress();

  const contractInfo = {
    erc20Token: {
      address: erc20TokenAddress,
      abi: erc20TokenJson.abi,
      arguments: [totalSupplyErc20],
    },
    erc721Token: {
      address: erc721TokenAddress,
      abi: erc721TokenJson.abi,
      arguments: [],
    },
    erc1155Token: {
      address: erc1155TokenAddress,
      abi: erc1155TokenJson.abi,
      arguments: [],
    },
    tokenSale: {
      address: tokenSaleAddress,
      abi: tokenSaleJson.abi,
      arguments: [erc20TokenAddress],
    },
    nftMarketplace: {
      address: nftMarketplaceAddress,
      abi: nftMarketplaceJson.abi,
      arguments: [
        erc20TokenAddress,
        erc721TokenAddress,
        erc1155TokenAddress,
        listingFees,
      ],
    },
  };

  writeContractInfoToJson(contractInfo);

  console.log("Contracts deployed successfully!");
  console.log("ERC20 Token:", erc20TokenAddress);
  console.log("ERC721 Token:", erc721TokenAddress);
  console.log("ERC1155 Token:", erc1155TokenAddress);
  console.log("Token Sale:", tokenSaleAddress);
  console.log("NFT Marketplace:", nftMarketplaceAddress);
}

function writeContractInfoToJson(contractInfo) {
  const filePath = "./contract.json";
  try {
    fs.writeFileSync(filePath, JSON.stringify(contractInfo, null, 2));
    console.log(`Contract info written to ${filePath}`);
  } catch (error) {
    console.error("Error writing contract info to JSON file:", error);
    process.exitCode = 1;
  }
}

async function deploy(contractName, args) {
  const contract = await ethers.deployContract(contractName, args);
  await contract.waitForDeployment();
  return contract;
}

deployContracts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
