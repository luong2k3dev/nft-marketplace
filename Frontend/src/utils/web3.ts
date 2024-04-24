import Web3 from "web3";
import config from "@/configs/config";

export const convertNumberToWei = (value: number) => {
  return Web3.utils.toWei(`${value}`, "ether");
};

export const numberToGweiHex = (value: number) => {
  return Web3.utils.toHex(Web3.utils.toWei(`${value}`, "gwei"));
};

export const convertWeiBigNumberToNumber = (value: bigint) => {
  if (value) {
    const toWeiNumber = Web3.utils.fromWei(`${value}`, "ether");
    return parseFloat(toWeiNumber);
  }

  return 0;
};

export const getBalance = async (address: string) => {
  try {
    const web3 = new Web3(config.linkRPC);
    let balance: any = await web3.eth.getBalance(address);
    balance = convertWeiBigNumberToNumber(balance);

    return parseFloat(balance.toFixed(5));
  } catch (error) {
    return 0;
  }
};
