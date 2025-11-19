import { jsonParser } from "@/utils/jsonParser";
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { v4 } from "uuid";

const initialState = {
  // default data
  allClientGroups: [],
  currGroup: null,
  allClientGroupsName: [],
  deleteClientGroupLoading: false,
  getAllClientGroupsLoading: false,
  createClientGroupLoading: false,
  setCurrClientGroupLoading: false,
  updateClientGroupLoading: false,
  getAllClientGroupsNameLoading: false,
  getSelectedClientGroupLoading: false,
};

const clientGroupSlice = createSlice({
  name: "client_group",
  initialState,
  reducers: {
    deleteClientGroup(state) {
      state.deleteClientGroupLoading = true;
    },
    deleteClientGroupSuccess(state, { payload }) {
      state.allClientGroups = state.allClientGroups.filter(
        (group) => group.client_group_id !== payload
      );

      state.deleteClientGroupLoading = false;
    },
    createClientGroup(state) {
      state.createClientGroupLoading = true;
    },
    createClientGroupSuccess(state, { payload }) {
      // state.currGroup = payload;
      // state.allClientGroups = [...payload, state.allClientGroups];
      state.createClientGroupLoading = false;
    },
    getAllClientGroups(state) {
      state.getAllClientGroupsLoading = true;
    },
    getAllClientGroupsSuccess(state, { payload }) {
      state.allClientGroups = payload;
      state.getAllClientGroupsLoading = false;
    },
    setCurrClientGroup(state) {
      state.setCurrClientGroupLoading = true;
    },
    setCurrClientGroupSuccess(state, { payload }) {
      state.currGroup = payload;
      // state.clientGroups = [] find id then replace
      state.setCurrClientGroupLoading = false;
    },
    updateClientGroup(state) {
      state.updateClientGroupLoading = true;
    },
    updateClientGroupSuccess(state, { payload }) {
      state.currGroup = payload;
      // state.clientGroups = [] find id then replace
      state.updateClientGroupLoading = false;
    },
    getAllClientGroupsName(state) {
      state.getAllClientGroupsNameLoading = true;
    },
    getAllClientGroupsNameSuccess(state, { payload }) {
      state.allClientGroupsName = payload;
      // state.clientGroups = [] find id then replace
      state.getAllClientGroupsNameLoading = false;
    },
    getSelectedClientGroup(state) {
      state.getSelectedClientGroupLoading = true;
    },
    getSelectedClientGroupSuccess(state, { payload }) {
      const res = payload;
      const updatedData = {
        ...res,
        columns : res?.columns.map(c => {
          return {
            ...c,
            options : JSON.parse(c?.options)
          }
        }),
      }
      state.currGroup = updatedData;
      // state.clientGroups = [] find id then replace
      state.getSelectedClientGroupLoading = false;
    },
  },
});

// Export the reducer functions as actions
export const {
  deleteClientGroup,
  deleteClientGroupSuccess,
  createClientGroup,
  createClientGroupSuccess,
  getAllClientGroups,
  getAllClientGroupsSuccess,
  setCurrClientGroup,
  setCurrClientGroupSuccess,
  updateClientGroup,
  updateClientGroupSuccess,
  getAllClientGroupsName,
  getAllClientGroupsNameSuccess,
  getSelectedClientGroup,
  getSelectedClientGroupSuccess,
} = clientGroupSlice.actions;

export const useSelectAllClientGroups = () =>
  useSelector((state) => state.clientGroup.allClientGroups);
export const useSelectCurrGroup = () =>
  useSelector((state) => state.clientGroup.currGroup);
export const useSelectAllClientGroupsName = () =>
  useSelector((state) => state.clientGroup.allClientGroupsName);

const clientGroupReducer = clientGroupSlice.reducer;

export default clientGroupReducer;
