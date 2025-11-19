// toastSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  toast: {
    message: "",
    status: "",
    show: false,
    loader: false,
  },
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast(state, { payload }) {
      const { message, status, loader } = payload;
      state.toast = {
        message: message,
        status: status,
        show: true,
        loader: loader,
      };
    },
    hideToast(state) {
      state.toast.show = false;
    },
  },
});

export const useSelectToast = () => useSelector((state) => state.toast.toast);

export const { showToast, hideToast } = toastSlice.actions;
const toastReducer = toastSlice.reducer;

export default toastReducer;
