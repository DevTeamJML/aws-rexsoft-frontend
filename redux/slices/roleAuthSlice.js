import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  userRoles: [],           // array of role objects
  userPermissions: [],     // flattened array of permission keys
  loading: false,
  error: "",
};

const roleAuthSlice = createSlice({
  name: "roleAuth",
  initialState,
  reducers: {
    getUserRoles(state, { payload }) {
      state.loading = true;
      state.error = "";
    },
    getUserRolesSuccess(state, { payload }) {
      const { roles, permissions } = payload;

      state.userRoles = roles;
      state.userPermissions = permissions;

      state.loading = false;
    },
    getUserRolesError(state, { payload }) {
      state.error = payload;
      state.loading = false;
    },
    clearUserRoleAuth(state) {
      return initialState;
    },
  },
});

export const {
  getUserRoles,
  getUserRolesSuccess,
  getUserRolesError,
  clearUserRoleAuth,
} = roleAuthSlice.actions;

export const useSelectUserRoles = () => useSelector((state) => state.roleAuth.userRoles);
export const useSelectUserPermissions = () => useSelector((state) =>
  state.roleAuth.userPermissions);
export const useSelectUserRoleLoading = () => useSelector((state) => state.roleAuth.loading);

const roleAuthReducer = roleAuthSlice.reducer;

export default roleAuthReducer;
