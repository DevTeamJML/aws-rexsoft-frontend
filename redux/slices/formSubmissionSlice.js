import { safeParseJSON } from "@/utils/validation";
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  allFormSubmissions: [],
  formSubmissionPagination: {
    pageIndex: 0,
    pageSize: 100,
    currentPage: 1,
    totalPages: 0,
  },
  userFormSubmissions: [],
  userFormSubmissionPagination: {
    pageIndex: 0,
    pageSize: 100,
    currentPage: 1,
    totalPages: 0,
  },
  allFormSubmissionsCount: {
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    resubmission_count: 0,
    total_count: 0,
  },
  userFormSubmissionsCount: {
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    resubmission_count: 0,
    total_count: 0,
  },
  currSelectedFormSubmissionGroupId: null,
  currSelectedFormSubmissionGroup: null,
  selectedFormSubmissionIds: [],
  targetedFormSubmissionData: null,
  // Loading
  getAllFormSubmissionsLoading: false,
  handleOnChangeFormSubmissionGroupLoading: false,
  createFormSubmissionLoading: false,
  updateFormSubmissionLoading: false,
  deleteFormSubmissionLoading: false,
  archiveFormSubmissionLoading: false,
  getFormSubmissionByIdLoading: false,
  getUserFormSubmissionLoading: false,
};

const formSubmissionSlice = createSlice({
  // changed slice name to match selectors: state.formSubmission
  name: "form_submission",
  initialState,
  reducers: {
    handleOnChangeFormSubmissionGroup(state) {
      state.handleOnChangeFormSubmissionGroupLoading = true;
    },
    handleOnChangeFormSubmissionGroupSuccess(state, { payload }) {
      state.currSelectedFormSubmissionGroupId = payload;
      state.handleOnChangeFormSubmissionGroupLoading = false;
    },
    createFormSubmission(state) {
      state.createFormSubmissionLoading = true;
    },
    createFormSubmissionSuccess(state, { payload }) {
      state.createFormSubmissionLoading = false;
    },
    getAllFormSubmissions(state) {
      state.getAllFormSubmissionsLoading = true;
    },
    getAllFormSubmissionsSuccess(state, { payload }) {
      state.allFormSubmissions = payload.data;
      state.allFormSubmissionsCount = payload.counts;
      state.formSubmissionPagination = payload.pagination;
      state.getAllFormSubmissionsLoading = false;
    },
    getFormSubmissionById(state) {
      state.getFormSubmissionByIdLoading = true;
    },
    getFormSubmissionByIdSuccess(state, { payload }) {
      state.targetedFormSubmissionData = {
        ...payload,
        previous_answers: safeParseJSON(payload.previous_answers),
      };

      state.getFormSubmissionByIdLoading = false;
    },
    updateFormSubmission(state) {
      state.updateFormSubmissionLoading = true;
    },
    updateFormSubmissionSuccess(state, { payload }) {
      state.updateFormSubmissionLoading = false;
    },
    deleteFormSubmission(state) {
      state.deleteFormSubmissionLoading = true;
    },
    deleteFormSubmissionSuccess(state, { payload }) {
      const targetFormSubmissionId = payload;
      const currList = state.userFormSubmissions;

      const updatedList = currList.filter(
        (formSubmission) =>
          formSubmission.form_submission_id !== targetFormSubmissionId
      );
      state.userFormSubmissions = updatedList;
      state.deleteFormSubmissionLoading = false;
    },

    getUserFormSubmission(state) {
      state.getUserFormSubmissionLoading = true;
    },
    getUserFormSubmissionSuccess(state, { payload }) {
      state.userFormSubmissions = payload.data;
      state.userFormSubmissionsCount = payload.counts;
      state.getUserFormSubmissionLoading = false;
    },
  },
});

// Export only the actions that actually exist in reducers
export const {
  handleOnChangeFormSubmissionGroup,
  handleOnChangeFormSubmissionGroupSuccess,
  createFormSubmission,
  createFormSubmissionSuccess,
  getAllFormSubmissions,
  getAllFormSubmissionsSuccess,
  getFormSubmissionById,
  getFormSubmissionByIdSuccess,
  updateFormSubmission,
  updateFormSubmissionSuccess,
  deleteFormSubmission,
  deleteFormSubmissionSuccess,
  getUserFormSubmission,
  getUserFormSubmissionSuccess,
} = formSubmissionSlice.actions;

export const useSelectUserFormSubmissions = () =>
  useSelector((state) => state.formSubmission.userFormSubmissions);
export const useSelectUserFormSubmissionPagination = () =>
  useSelector((state) => state.formSubmission.userFormSubmissionPagination);

export const useSelectAllFormSubmissions = () =>
  useSelector((state) => state.formSubmission.allFormSubmissions);
export const useSelectFormSubmissionPagination = () =>
  useSelector((state) => state.formSubmission.formSubmissionPagination);
export const useSelectGetAllFormSubmissionsLoading = () =>
  useSelector((state) => state.formSubmission.getAllFormSubmissionsLoading);
export const useSelectCurrSelectedFormSubmissionGroupId = () =>
  useSelector(
    (state) => state.formSubmission.currSelectedFormSubmissionGroupId
  );
export const useSelectCurrSelectedFormSubmissionGroup = () =>
  useSelector((state) => state.formSubmission.currSelectedFormSubmissionGroup);
export const useSelectSelectedFormSubmissionIds = () =>
  useSelector((state) => state.formSubmission.selectedFormSubmissionIds);
export const useSelectTargetedFormSubmissionData = () =>
  useSelector((state) => state.formSubmission.targetedFormSubmissionData);
export const useSelectAllFormSubmissionsCount = () =>
  useSelector((state) => state.formSubmission.allFormSubmissionsCount);

export const useSelectUserFormSubmissionsCount = () =>
  useSelector((state) => state.formSubmission.userFormSubmissionsCount);

const formSubmissionReducer = formSubmissionSlice.reducer;

export default formSubmissionReducer;
