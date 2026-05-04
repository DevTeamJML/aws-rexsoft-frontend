import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { v4 } from "uuid";

const initialState = {
  allCompanies: [],
  currCompany: null,
  currCompanyId: "",
  allCompanyUsers: [],
  isAdmin: false,

  // Loading
  switchCompanyLoading: false,
  createCompanyLoading: false,
  setCurrCompanyIdLoading: false,
  getAllCompaniesLoading: false,
  setCompanyLoading: false,
  getAllCompanyUsersLoading: false,
  updateCompanyUserLoading : false,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    switchCompany(state) {
      state.switchCompanyLoading = true;
    },
    switchCompanySuccess(state, { payload }) {
      if (payload) {
        state.currCompany = payload;
        state.currCompanyId = payload.company_id;
      } else {
        state.currCompany = null;
        state.currCompanyId = "";
      }

      state.switchCompanyLoading = false;
    },
    createCompany(state) {
      state.createCompanyLoading = true;
    },
    createCompanySuccess(state) {
      state.createCompanyLoading = false;
    },
    setCurrCompanyId(state) {
      state.setCurrCompanyIdLoading = true;
    },
    setCurrCompanyIdSuccess(state) {
      state.setCurrCompanyIdLoading = false;
    },
    getAllCompanies(state) {
      state.getAllCompaniesLoading = true;
    },
    getAllCompaniesSuccess(state, { payload }) {
      state.allCompanies = payload;
      state.getAllCompaniesLoading = false;
    },
    setCurrCompany(state) {
      state.setCompanyLoading = true;
    },
    setCurrCompanySuccess(state, { payload }) {
      state.group = payload;
      // state.clientGroups = [] find id then replace
      state.setCompanyLoading = false;
    },
    getAllCompanyUsers(state) {
      state.setCompanyLoading = true;
    },
    getAllCompanyUsersSuccess(state, { payload }) {
      state.allCompanyUsers = payload.list;
      state.loading = false;

      const currentUserId = payload.currentUserId;

      const currUser = payload.list.find((u) => u.user_id === currentUserId);

      state.isAdmin = currUser?.is_owner === 1;
    },
    updateCompanyUser(state) {
      state.updateCompanyUserLoading = true;
    },
    updateCompanyUserSuccess(state, { payload }) {
      const { user_id, first_name, last_name, email } = payload;

      const index = state.allCompanyUsers.findIndex(
        (u) => u.user_id === user_id,
      );

      if (index !== -1) {
        state.allCompanyUsers[index] = {
          ...state.allCompanyUsers[index],
          first_name,
          last_name,
          email,
        };
      }

      state.updateCompanyUserLoading = false;
    },
  },
});

// Export the reducer functions as actions
export const {
  switchCompany,
  switchCompanySuccess,
  createCompany,
  createCompanySuccess,
  getAllCompanies,
  getAllCompaniesSuccess,
  setCurrCompanyId,
  setCurrCompanyIdSuccess,
  setCurrCompany,
  setCurrCompanySuccess,
  getAllCompanyUsers,
  getAllCompanyUsersSuccess,
  updateCompanyUser,
  updateCompanyUserSuccess
} = companySlice.actions;

export const useSelectAllCompanies = () =>
  useSelector((state) => state.company.allCompanies);
export const useSelectCurrCompany = () =>
  useSelector((state) => state.company.currCompany);
export const useSelectCurrCompanyId = () =>
  useSelector((state) => state.company.currCompanyId);
export const useSelectAllCompanyUsers = () =>
  useSelector((state) => state.company.allCompanyUsers);
export const useSelectIsAdmin = () =>
  useSelector((state) => state.company.isAdmin);

const companyReducer = companySlice.reducer;

export default companyReducer;
