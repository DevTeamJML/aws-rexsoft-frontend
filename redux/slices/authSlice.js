import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  user: null,
  signInLoading: false,
  signInError: "",
  logOutLoading: false,
  logOutError: "",
  refreshSignInLoading: false,
  refreshSignInError: "",
  resetPasswordLoading: false,
  resetPasswordError: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn(state) {
      state.signInLoading = true;
    },
    signInSuccess(state, { payload }) {
      state.user = payload;
      state.signInLoading = false;
    },
    signInError(state, { payload }) {
      state.signInError = payload;
      state.signInLoading = false;
    },
    logOut(state) {
      state.logOutLoading = true;
    },
    logOutSuccess(state, { payload }) {
      state.user = payload;
      state.logOutLoading = false;
    },
    logOutError(state, { payload }) {
      state.logOutError = payload;
      state.logOutLoading = false;
    },
    refreshSignIn(state) {
      state.refreshSignInLoading = true;
    },
    refreshSignInSuccess(state, { payload }) {
      state.user = payload;
      state.refreshSignInLoading = false;
    },
    refreshSignInError(state, { payload }) {
      state.refreshSignInError = payload;
      state.refreshSignInLoading = false;
    },
    resetPassword(state) {
      state.resetPasswordLoading = true;
    },
    resetPasswordSuccess(state, { payload }) {
      state.resetPasswordLoading = false;
    },
    resetPasswordError(state, { payload }) {
      state.resetPasswordError = payload;
      state.resetPasswordLoading = false;
    },
  },
});

// Export the reducer functions as actions
export const {
  signIn,
  signInSuccess,
  signInError,
  logOut,
  logOutSuccess,
  logOutError,
  refreshSignIn,
  refreshSignInSuccess,
  refreshSignInError,
  resetPassword,
  resetPasswordSuccess,
  resetPasswordError,
} = authSlice.actions;

export const useSelectUser = () => useSelector((state) => state.user.user);
export const useSelectSignInLoading = () =>
  useSelector((state) => state.user.signInLoading);
export const useSelectSignInError = () =>
  useSelector((state) => state.user.signInError);
export const useSelectLogOutLoading = () =>
  useSelector((state) => state.user.logOutLoading);
export const useSelectLogOutError = () =>
  useSelector((state) => state.user.logOutError);
export const useSelectRefreshSignInLoading = () =>
  useSelector((state) => state.user.refreshSignInLoading);
export const useSelectRefreshSignInError = () =>
  useSelector((state) => state.user.refreshSignInError);
export const useSelectResetPasswordLoading = () =>
  useSelector((state) => state.user.resetPasswordLoading);
export const useSelectResetPasswordError = () =>
  useSelector((state) => state.user.resetPasswordError);

const authReducer = authSlice.reducer;

export default authReducer;
