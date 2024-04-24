import { RootState } from "@/redux/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OrderState {
  isLoading: boolean;
}

const initialState: OrderState = {
  isLoading: false,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoading } = orderSlice.actions;

export const selectLoading = (state: RootState) => state.order.isLoading;

export default orderSlice.reducer;
