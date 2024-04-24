import config from "@/configs/config";
import { setLoading } from "@/redux/features/order/orderSlice";
import { updateAddress } from "@/redux/features/user/userSlice";
import { toast } from "react-toastify";

declare global {
  interface Window {
    ethereum: any;
  }
}

const checkMetamaskInstalled = (dispatch: any) => {
  const ethChain = window?.ethereum;
  if (ethChain === undefined) {
    dispatch(setLoading(false));
    console.error("Please install Metamask Extension!");
    toast.error("Please install Metamask Extension!");
    return false;
  }
  return true;
};

const handleAddNetwork = async (ethChain: any, dispatch: any) => {
  try {
    await ethChain.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: config.chainId[0],
          chainName: config.nameChain,
          rpcUrls: [config.linkRPC],
          iconUrls: [],
          nativeCurrency: {
            name: config.symbol,
            symbol: config.symbol,
            decimals: 18,
          },
          blockExplorerUrls: [config.linkScan],
        },
      ],
    });
    dispatch(setLoading(true));
  } catch (error) {
    console.error(error);
    dispatch(setLoading(true));
  }
};

export const handleConnectWallet = async (dispatch: any) => {
  dispatch(setLoading(true));

  if (checkMetamaskInstalled(dispatch)) {
    const ethChain = window.ethereum;
    ethChain.autoRefreshOnNetworkChange = false;
    ethChain.isConnected();

    try {
      const accounts: Array<string> = await ethChain.request({
        method: "eth_requestAccounts",
        params: [],
      });
      if (accounts.length === 0) {
        console.log("Please connect to ETH Chain!");
      } else {
        const addressUser: string = accounts[0];

        ethChain.on("accountsChanged", (accountsChange: Array<string>) => {
          localStorage.setItem("address", accountsChange[0]);
          dispatch(updateAddress(accountsChange[0]));
        });

        let chainId: string = await ethChain.request({
          method: "eth_chainId",
          params: [],
        });

        const isMumbaiChain = config.chainId.includes(chainId);

        if (isMumbaiChain) {
          localStorage.setItem("address", addressUser);
          dispatch(setLoading(true));
        } else {
          try {
            await ethChain.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: config.chainId[0] }],
            });
            localStorage.setItem("address", addressUser);
            dispatch(setLoading(true));
          } catch (err) {
            handleAddNetwork(ethChain, dispatch);
            console.error(err);
          }
        }
        dispatch(updateAddress(addressUser));
        toast.success("Okela!");
      }
    } catch (error) {
      dispatch(setLoading(true));
      console.error(error);
      toast.error("Error connecting wallet.");
    }
  }
};
