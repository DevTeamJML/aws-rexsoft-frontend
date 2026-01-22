// src/redux/slices/roleSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  list: [], // role list (for role-list)
  current: null, // single role detail (getRoleById)
  loading: false, // generic loading flag
  listLoading: false, // loading for list
  creating: false, // create role loading
  updating: false, // update role loading
  error: "", // generic error
  listError: "", // list error
  detailError: "", // single role error
  deleteRoleLoading: false,
  deleteRoleError: "",
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    // GET ALL
    getAllRoles(state, { payload }) {
      state.listLoading = true;
      state.listError = "";
    },
    getAllRolesSuccess(state, { payload }) {
      state.list = payload || [];
      state.listLoading = false;
    },
    getAllRolesError(state, { payload }) {
      state.listError = payload;
      state.listLoading = false;
    },

    // GET ONE
    getRole(state, { payload }) {
      state.loading = true;
      state.detailError = "";
      // optionally clear current
      state.current = null;
    },
    getRoleSuccess(state, { payload }) {
      state.current = payload;
      state.loading = false;
    },
    getRoleError(state, { payload }) {
      state.detailError = payload;
      state.loading = false;
    },

    // CREATE
    createRole(state, { payload }) {
      state.creating = true;
      state.error = "";
    },
    createRoleSuccess(state, { payload }) {
      // push created role to list (if needed)
      if (payload) {
        state.list = [payload, ...state.list];
      }
      state.creating = false;
    },
    createRoleError(state, { payload }) {
      state.error = payload;
      state.creating = false;
    },

    // UPDATE (we use POST /update with role_id in body as you prefer)
    updateRole(state, { payload }) {
      state.updating = true;
      state.error = "";
    },
    updateRoleSuccess(state, { payload }) {
      state.updating = false;
      // update list and current if present
      if (payload && payload.role_id) {
        state.list = state.list.map((r) =>
          r.role_id === payload.role_id ? payload : r
        );
        if (state.current && state.current.role_id === payload.role_id) {
          state.current = payload;
        }
      }
    },
    updateRoleError(state, { payload }) {
      state.error = payload;
      state.updating = false;
    },

    // optional: reset current role
    resetCurrentRole(state) {
      state.current = null;
      state.detailError = "";
    },

    deleteRole(state) {
      state.deleteRoleLoading = true;
      state.deleteRoleError = "";
    },
    deleteRoleSuccess(state, { payload }) {
      state.deleteRoleLoading = false;
      state.deleteRoleError = "";
      // optionally remove from list:
      const roleId = payload.role_id;
      state.list = state.list?.filter((r) => r.role_id !== roleId);
    },
    deleteRoleError(state, action) {
      state.deleteRoleLoading = false;
      state.deleteRoleError = action.payload;
    },
  },
});

export const {
  getAllRoles,
  getAllRolesSuccess,
  getAllRolesError,
  getRole,
  getRoleSuccess,
  getRoleError,
  createRole,
  createRoleSuccess,
  createRoleError,
  updateRole,
  updateRoleSuccess,
  updateRoleError,
  resetCurrentRole,
  deleteRole,
  deleteRoleError,
  deleteRoleSuccess,
} = roleSlice.actions;

export const useSelectAllRoles = () => useSelector((state) => state.role.list);
export const useSelectRoleListLoading = () =>
  useSelector((state) => state.role.listLoading);
export const useSelectRoleCreating = () =>
  useSelector((state) => state.role.creating);
export const useSelectRoleUpdating = () =>
  useSelector((state) => state.role.updating);
export const useSelectRoleCurrent = () =>
  useSelector((state) => state.role.current);
export const useSelectRoleLoading = () =>
  useSelector((state) => state.role.loading);
export const useSelectRoleError = () =>
  useSelector((state) => state.role.error);

const roleReducer = roleSlice.reducer;

export default roleReducer;
