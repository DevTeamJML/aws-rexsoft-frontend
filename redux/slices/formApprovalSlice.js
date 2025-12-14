import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  updateFormSubmissionLoading: false,
};

const formApprovalSlice = createSlice({
  name: "form_approval",
  initialState,
  reducers: {

    updateFormSubmissionApproval(state) {
      state.updateFormSubmissionLoading = true;
    },
    updateFormSubmissionApprovalSuccess(state) {
      state.updateFormSubmissionLoading = false;
    },
  },
});

export const {
  updateFormSubmissionApproval,
  updateFormSubmissionApprovalSuccess,
} = formApprovalSlice.actions;

export const useSelectUpdateFormSubmissionLoading = () =>
  useSelector((state) => state.formApproval.updateFormSubmissionLoading);

const formApprovalReducer = formApprovalSlice.reducer;

export default formApprovalReducer;

