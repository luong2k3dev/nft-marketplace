import Web3 from "web3";
import type { Contract, ContractAbi } from "web3";
import config from "@/configs/config";

const web3 = new Web3(config.linkRPC);

// Define a type for the slice state
export interface ContractState {
  erc20Token: Contract<ContractAbi>;
  erc721Token: Contract<ContractAbi>;
  erc1155Token: Contract<ContractAbi>;
  tokenSale: Contract<ContractAbi>;
  nftMarketplace: Contract<ContractAbi>;
}

export const contracts: ContractState = {
  erc20Token: new web3.eth.Contract(
    config.contracts.erc20Token.abi,
    config.contracts.erc20Token.address
  ),
  erc721Token: new web3.eth.Contract(
    config.contracts.erc721Token.abi,
    config.contracts.erc721Token.address
  ),
  erc1155Token: new web3.eth.Contract(
    config.contracts.erc1155Token.abi,
    config.contracts.erc1155Token.address
  ),
  tokenSale: new web3.eth.Contract(
    config.contracts.tokenSale.abi,
    config.contracts.tokenSale.address
  ),
  nftMarketplace: new web3.eth.Contract(
    config.contracts.nftMarketplace.abi,
    config.contracts.nftMarketplace.address
  ),
};
