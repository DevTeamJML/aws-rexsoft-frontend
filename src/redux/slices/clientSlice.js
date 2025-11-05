import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
const initialState = {
  allClients: [],
  allClientsCount : 0,
  currSelectedClientGroupId: null,
  currSelectedClientGroup: null,
  selectedClientIds: [],
  targetedClientData: null,
  // Loading
  getAllClientsLoading: false,
  setSelectedClientGroupIdLoading: false,
  setSelectedClientGroupLoading: false,
  handleOnChangeClientGroupLoading: false,
  bulkCreateClientLoading : false,
  createClientLoading: false,
  updateClientLoading: false,
  setSelectedClientIdsLoading: false,
  bulkUpdateClientLoading: false,
  deleteClientLoading: false,
  bulkDeleteClientLoading: false,
  getClientDataByClientIdLoading: false,
  getAllClientsCountLoading: false,
};

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    handleOnChangeClientGroup(state) {
      state.handleOnChangeClientGroupLoading = true;
    },
    handleOnChangeClientGroupSuccess(state, { payload }) {
      state.currSelectedClientGroupId = payload;
      state.handleOnChangeClientGroupLoading = false;
    },
    setSelectedClientGroupId(state) {
      state.setSelectedClientGroupIdLoading = true;
    },
    setSelectedClientGroupIdSuccess(state, { payload }) {
      state.currSelectedClientGroupId = payload;
      state.setSelectedClientGroupIdLoading = false;
    },
    setSelectedClientGroup(state) {
      state.setSelectedClientGroupLoading = true;
    },
    setSelectedClientGroupSuccess(state, { payload }) {
      state.currSelectedClientGroup = payload;
      state.setSelectedClientGroupLoading = false;
    },
    bulkCreateClient(state) {
      state.bulkCreateClientLoading = true;
    },
    bulkCreateClientSuccess(state, { payload }) {
      state.bulkCreateClientLoading = false;
    },
    createClient(state) {
      state.createClientLoading = true;
    },
    createClientSuccess(state, { payload }) {
      state.createClientLoading = false;
    },
    getAllClients(state) {
      state.getAllClientsLoading = true;
    },
    getAllClientsSuccess(state, { payload }) {
      state.allClients = payload;
      state.getAllClientsLoading = false;
    },
    getAllClientsCount(state) {
      state.getAllClientsCountLoading = true;
    },
    getAllClientsCountSuccess(state, { payload }) {
      state.allClientsCount = payload["client_count"] || 0;
      state.getAllClientsCountLoading = false;
    },
    getClientDataByClientId(state) {
      state.getClientDataByClientIdLoading = true;
    },
    getClientDataByClientIdSuccess(state, { payload }) {
      state.targetedClientData = payload;
      state.getClientDataByClientIdLoading = false;
    },
    updateClient(state) {
      state.updateClientLoading = true;
    },
    updateClientSuccess(state, { payload }) {
      state.updateClientLoading = false;
    },
    setSelectedClientIds(state) {
      state.setSelectedClientIdsLoading = true;
    },
    setSelectedClientIdsSuccess(state, { payload }) {
      state.selectedClientIds = payload;
      state.setSelectedClientIdsLoading = false;
    },
    bulkUpdateClient(state) {
      state.bulkUpdateClientLoading = true;
    },
    bulkUpdateClientSuccess(state, { payload }) {
      state.bulkUpdateClientLoading = false;
    },
    deleteClient(state) {
      state.deleteClientLoading = true;
    },
    deleteClientSuccess(state, { payload }) {
      const targetClientId = payload;
      const currClients = state.allClients;
      const updatedList = currClients.filter((client)=>client.client_id !== targetClientId);
      state.allClients = updatedList;
      state.deleteClientLoading = false;
    },
    bulkDeleteClient(state) {
      state.bulkDeleteClientLoading = true;
    },
    bulkDeleteClientSuccess(state, { payload }) {
      const targetClientIdList = payload;
      const currClients = state.allClients;
      const updatedList = currClients.filter((client)=>!targetClientIdList.includes(client.client_id));
      state.allClients = updatedList;
      state.bulkDeleteClientLoading = false;
    },
  },
});

// Export the reducer functions as actions
export const {
  setSelectedClientGroupId,
  setSelectedClientGroupIdSuccess,
  setSelectedClientGroup,
  setSelectedClientGroupSuccess,
  handleOnChangeClientGroup,
  handleOnChangeClientGroupSuccess,
  bulkCreateClient,
  bulkCreateClientSuccess,
  createClient,
  createClientSuccess,
  getAllClients,
  getAllClientsSuccess,
  updateClient,
  updateClientSuccess,
  setSelectedClientIds,
  setSelectedClientIdsSuccess,
  bulkUpdateClient,
  bulkUpdateClientSuccess,
  deleteClient,
  deleteClientSuccess,
  bulkDeleteClient,
  bulkDeleteClientSuccess,
  getClientDataByClientId,
  getClientDataByClientIdSuccess,
  getAllClientsCount,
  getAllClientsCountSuccess
} = clientSlice.actions;

export const useSelectAllClients = () =>
  useSelector((state) => state.client.allClients);
export const useSelectGetAllClientsLoading = () =>
  useSelector((state) => state.client.getAllClientsLoading);
export const useSelectCurrSelectedGroupId = () =>
  useSelector((state) => state.client.currSelectedClientGroupId);
export const useSelectCurrSelectedGroup = () =>
  useSelector((state) => state.client.currSelectedClientGroup);
export const useSelectSelectedClientIds = () =>
  useSelector((state) => state.client.selectedClientIds);
export const useSelectTargetedClientData = () =>
  useSelector((state) => state.client.targetedClientData);
export const useSelectAllClientsCount = () =>
  useSelector((state) => state.client.allClientsCount);

const clientReducer = clientSlice.reducer;

export default clientReducer;
