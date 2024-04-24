import React, { FC, useEffect, useState } from "react";
import Logo from "@/shared/Logo/Logo";
import MenuBar from "@/shared/MenuBar/MenuBar";
import SwitchDarkMode from "@/shared/SwitchDarkMode/SwitchDarkMode";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Navigation from "@/shared/Navigation/Navigation";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Loader from "../Loader";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectAddress,
  selectBalance,
  updateBalance,
} from "@/redux/features/user/userSlice";
import { selectLoading } from "@/redux/features/order/orderSlice";
import { handleConnectWallet } from "@/utils/connectWallet";
import { formatAddress } from "@/utils/common";
import { getBalance } from "@/utils/web3";

export interface MainNav2LoggedProps {}

const MainNav2Logged: FC<MainNav2LoggedProps> = () => {
  const address: string = useAppSelector(selectAddress);
  const balance: number = useAppSelector(selectBalance);
  const isLoading: boolean = useAppSelector(selectLoading);
  const dispatch = useAppDispatch();

  const connectWallet = () => {
    handleConnectWallet(dispatch);
  };

  const getBalanceUser = async (address: string) => {
    const balance: number = await getBalance(address);

    dispatch(updateBalance(balance));
  };

  useEffect(() => {
    if (address) {
      getBalanceUser(address);
    }
  }, [address]);

  return (
    <div className={`nc-MainNav2Logged relative z-10`}>
      <div className="container">
        <div className="h-20 flex justify-between space-x-4 xl:space-x-8">
          <div className="self-center flex justify-start flex-grow space-x-3 sm:space-x-8 lg:space-x-10">
            <Logo />
            <div className="hidden sm:block flex-grow max-w-xs">
              <form action="" method="POST" className="relative">
                <Input
                  type="search"
                  placeholder="Search items"
                  className="pr-10 w-full"
                  sizeClass="h-[42px] pl-4 py-3"
                />
                <span className="absolute top-1/2 -translate-y-1/2 right-3 text-neutral-500">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 22L20 20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input type="submit" hidden value="" />
              </form>
            </div>
          </div>
          <div className="flex-shrink-0 flex justify-end text-neutral-700 dark:text-neutral-100 space-x-1">
            <div className="hidden xl:flex space-x-2">
              <Navigation />
              <div className="self-center hidden sm:block h-6 border-l border-neutral-300 dark:border-neutral-6000"></div>
              <div className="flex">
                <SwitchDarkMode />
                <NotifyDropdown />
              </div>
              <div></div>
              <ButtonPrimary
                className="self-center"
                href="/upload-item"
                sizeClass="px-4 py-2 sm:px-5"
              >
                Create
              </ButtonPrimary>
              <div></div>
              {address === "" ? (
                <ButtonSecondary
                  onClick={connectWallet}
                  className="self-center"
                  sizeClass="px-4 py-2 sm:px-5"
                >
                  {isLoading ? <Loader /> : "Connect Wallet"}
                </ButtonSecondary>
              ) : (
                <AvatarDropdown
                  wallet={formatAddress(address)}
                  balance={balance}
                  username="Từ Nhật Lương"
                  profileImage="https://phunugioi.com/wp-content/uploads/2020/10/anh-dai-dien-avt-anime-1.jpg"
                />
              )}
            </div>
            <div className="flex items-center space-x-1 xl:hidden">
              <NotifyDropdown />
              {address === "" ? (
                <AvatarDropdown />
              ) : (
                <AvatarDropdown
                  wallet={formatAddress(address)}
                  balance={balance}
                  username="Từ Nhật Lương"
                  profileImage="https://phunugioi.com/wp-content/uploads/2020/10/anh-dai-dien-avt-anime-1.jpg"
                />
              )}
              <MenuBar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav2Logged;
