import { ContractInfo } from "./configEnv";

export interface ConfigEnv {
  urlWeb: string;
  urlApi: string;
  urlSocket: string;
  linkScan: string;
  chainId: string[];
  nameChain: string;
  linkRPC: string;
  symbol: string;
  contracts: {
    [contractName: string]: ContractInfo;
  };
}
