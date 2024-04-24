import { ConfigEnv } from "@/interface/contractInfo";
import contractInfo from "../abis/contract.json";

export const configDevelopment: ConfigEnv = {
  urlWeb: "",
  urlApi: "",
  urlSocket: "",
  linkScan: "https://mumbai.polygonscan.com",
  chainId: ["0x13881", "80001"],
  nameChain: "MUMBAI Testnet",
  linkRPC: "https://polygon-mumbai-pokt.nodies.app",
  symbol: "MATIC",
  contracts: {
    erc20Token: {
      address: contractInfo.erc20Token.address,
      abi: contractInfo.erc20Token.abi,
    },
    erc721Token: {
      address: contractInfo.erc721Token.address,
      abi: contractInfo.erc721Token.abi,
    },
    erc1155Token: {
      address: contractInfo.erc1155Token.address,
      abi: contractInfo.erc1155Token.abi,
    },
    tokenSale: {
      address: contractInfo.tokenSale.address,
      abi: contractInfo.tokenSale.abi,
    },
    nftMarketplace: {
      address: contractInfo.nftMarketplace.address,
      abi: contractInfo.nftMarketplace.abi,
    },
  },
};
