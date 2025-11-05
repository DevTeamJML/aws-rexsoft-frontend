import { createSlice, current } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  isOpenNewCompanyModal: false,
};

export const newCompanyModalSlice = createSlice({
  name: "newCompanyModal",
  initialState,
  reducers: {
    toggleNewCompanyModal(state, { payload }) {
      state.isOpenNewCompanyModal = payload;
    },
  },
});

export const {
  toggleNewCompanyModal,
} = newCompanyModalSlice.actions;

export const useSelectNewCompanyModal = () =>
  useSelector((state) => state.newCompanyModal.isOpenNewCompanyModal);

const newCompanyModalReducer = newCompanyModalSlice.reducer;

export default newCompanyModalReducer;
