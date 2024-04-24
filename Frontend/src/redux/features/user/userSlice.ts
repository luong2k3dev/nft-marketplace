import { UserInfo } from "@/interface/userInfo";
import { RootState } from "@/redux/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  address: string;
  balance: number;
  user: UserInfo;
}

const initialState: UserState = {
  address: "",
  balance: 0,
  user: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    updateBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    updateUser: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
    },
  },
});

export const { updateAddress, updateBalance ,updateUser } = userSlice.actions;

export const selectAddress = (state: RootState) => state.user.address;
export const selectBalance = (state: RootState) => state.user.balance;
export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;
