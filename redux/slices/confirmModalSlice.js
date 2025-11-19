import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  unsavedChanges: false,
  showModal: false,
  pendingPath: null,
};

const confirmModalSlice = createSlice({
  name: "confirmModal",
  initialState,
  reducers: {
    setUnsavedChanges: (state, { payload }) => {
      state.unsavedChanges = payload;
    },
    setShowModal: (state, { payload }) => {
      state.showModal = payload;
    },
    setPendingPath: (state, { payload }) => {
      state.pendingPath = payload;
    },
    resetUnsavedState: (state) => {
      state.unsavedChanges = false;
      state.showModal = false;
      state.pendingPath = null;
    },
  },
});

// Export the reducer functions as actions
export const {
    setUnsavedChanges,
    setShowModal,
    setPendingPath,
    resetUnsavedState,
} = confirmModalSlice.actions;

export const useSelectUnsavedChanges = () =>
  useSelector((state) => state.confirmModal.unsavedChanges);

export const useSelectShowModal = () =>
  useSelector((state) => state.confirmModal.showModal);

export const useSelectPendingPath = () =>
  useSelector((state) => state.confirmModal.pendingPath);

const confirmModalReducer = confirmModalSlice.reducer;

export default confirmModalReducer;
