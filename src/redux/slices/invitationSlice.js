/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  invitation: {
    invitation_id: "",
    company_id: "",
    role_id: "",
    first_name: "",
    email: "",
    created_at: "",
    updated_at: "",
    user_exists: false,
    company_name: "",
    user_id: "",
  },
  allInvitationAndUser : [],
  getInvitationByIdLoading: false,
  getInvitationByIdError: undefined,
  acceptInvitationLoading: false,
  acceptInvitationError: undefined,
  registerAndAcceptInvitationLoading: false,
  registerAndAcceptInvitationError: undefined,
  resendInvitationLoading: false,
  resendInvitationError: undefined,
  inviteUserToCompanyLoading: false,
  inviteUserToCompanyError: "",
  getAllInvitationAndUserLoading: false,
  getAllInvitationAndUserError: "",
  removeInvitationLoading: false,
  removeInvitationError : false,
};

const invitationSlice = createSlice({
  name: "invitation",
  initialState,
  reducers: {
    getInvitationById(state) {
      state.getInvitationByIdLoading = true;
    },
    getInvitationByIdSuccess(state, { payload }) {
      console.log(payload);
      state.invitation = payload;
      state.getInvitationByIdLoading = false;
    },
    getInvitationByIdError(state, { payload }) {
      state.getInvitationByIdError = payload;
      state.getInvitationByIdLoading = false;
    },
    acceptInvitation(state) {
      state.acceptInvitationLoading = true;
    },
    acceptInvitationSuccess(state) {
      state.acceptInvitationLoading = false;
    },
    acceptInvitationError(state, { payload }) {
      state.acceptInvitationError = payload;
      state.acceptInvitationLoading = false;
    },
    registerAndAcceptInvitation(state) {
      state.registerAndAcceptInvitationLoading = true;
    },
    registerAndAcceptInvitationSuccess(state) {
      state.registerAndAcceptInvitationLoading = false;
    },
    registerAndAcceptInvitationError(state, { payload }) {
      state.registerAndAcceptInvitationError = payload;
      state.registerAndAcceptInvitationLoading = false;
    },
    resendInvitation(state) {
      state.resendInvitationLoading = true;
    },
    resendInvitationSuccess(state) {
      state.resendInvitationLoading = false;
    },
    resendInvitationError(state, { payload }) {
      state.resendInvitationError = payload;
      state.resendInvitationLoading = false;
    },
    inviteUserToCompany(state) {
      state.inviteUserToCompanyLoading = true;
    },
    inviteUserToCompanySuccess(state, { payload }) {
      state.inviteUserToCompanyLoading = false;
    },
    inviteUserToCompanyError(state, { payload }) {
      state.inviteUserToCompanyError = payload;
      state.inviteUserToCompanyLoading = false;
    },
    getAllInvitationAndUser(state) {
      state.getAllInvitationAndUserLoading = true;
    },
    getAllInvitationAndUserSuccess(state, { payload }) {
      state.allInvitationAndUser = payload;
      state.getAllInvitationAndUserLoading = false;
    },
    getAllInvitationAndUserError(state, { payload }) {
      state.getAllInvitationAndUserError = payload;
      state.getAllInvitationAndUserLoading = false;
    },
    removeInvitatioAndUser(state) {
      state.removeInvitationLoading = true;
    },
    removeInvitationSuccess(state, { payload }) {
      const targetInvitationId = payload;
      const currInvitation = state.allInvitationAndUser;
      const updatedList = currInvitation.filter((i)=>i.id !== targetInvitationId);
      state.allInvitationAndUser = updatedList;
      state.removeInvitationLoading = false;
    },
    removeInvitationError(state, { payload }) {
      state.removeInvitationError = payload;
      state.removeInvitationLoading = false;
    },
  },
});

export const {
  getInvitationById,
  getInvitationByIdSuccess,
  getInvitationByIdError,
  acceptInvitation,
  acceptInvitationSuccess,
  acceptInvitationError,
  registerAndAcceptInvitation,
  registerAndAcceptInvitationSuccess,
  registerAndAcceptInvitationError,
  resendInvitation,
  resendInvitationSuccess,
  resendInvitationError,
  inviteUserToCompany,
  inviteUserToCompanySuccess,
  inviteUserToCompanyError,
  getAllInvitationAndUser,
  getAllInvitationAndUserSuccess,
  getAllInvitationAndUserError,
  removeInvitatioAndUser,
  removeInvitationError,
  removeInvitationSuccess
} = invitationSlice.actions;

export const selectInvitation = () =>
  useSelector((state) => state.invitation.invitation);
export const useSelectAllInvitationAndUser = () =>
  useSelector((state) => state.invitation.allInvitationAndUser);
export const selectRetrieveInvitationLoading = () =>
  useSelector((state) => state.invitation.getInvitationByIdLoading);
export const selectRetrieveInvitationError = () =>
  useSelector((state) => state.invitation.getInvitationByIdError);
export const selectAcceptInvitationLoading = () =>
  useSelector((state) => state.invitation.acceptInvitationLoading);
export const selectAcceptInvitationError = () =>
  useSelector((state) => state.invitation.acceptInvitationError);
export const selectRegisterAndAcceptInvitationLoading = () =>
  useSelector((state) => state.invitation.registerAndAcceptInvitationLoading);
export const selectRegisterAndAcceptInvitationError = () =>
  useSelector((state) => state.invitation.registerAndAcceptInvitationError);
export const selectResendInvitationLoading = () =>
  useSelector((state) => state.invitation.resendInvitationLoading);
export const selectResendInvitationError = () =>
  useSelector((state) => state.invitation.resendInvitationError);
export const useSelectInviteUserToCompanyLoading = () =>
  useSelector((state) => state.user.inviteUserToCompanyLoading);
export const useSelectInviteUserToCompanyError = () =>
  useSelector((state) => state.user.inviteUserToCompanyError);
export const useSelectGetAllInvitationAndUserLoading = () =>
  useSelector((state) => state.user.getAllInvitationAndUserLoading);
export const useSelectGetAllInvitationAndUserError = () =>
  useSelector((state) => state.user.getAllInvitationAndUserError);
export const useSelectRemoveInvitationLoading = () =>
  useSelector((state) => state.user.removeInvitationLoading);
export const useSelectRemoveInvitationError = () =>
  useSelector((state) => state.user.removeInvitationError);
const invitationReducer = invitationSlice.reducer;

export default invitationReducer;
