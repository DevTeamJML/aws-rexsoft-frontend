import { jsonParser } from "@/utils/jsonParser";
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { v4 } from "uuid";

const initialState = {
  // default data
  allFormTemplates: [],
  currTemplate: null,
  allFormTemplatesName: [],
  deleteFormTemplateLoading: false,
  getAllFormTemplatesLoading: false,
  createFormTemplateLoading: false,
  setCurrFormTemplateLoading: false,
  updateFormTemplateLoading: false,
  getAllFormTemplatesNameLoading: false,
  getFormTemplateByIdLoading: false,
};

const formTemplateSlice = createSlice({
  name: "form_template",
  initialState,
  reducers: {
    deleteFormTemplate(state) {
      state.deleteFormTemplateLoading = true;
    },
    deleteFormTemplateSuccess(state, { payload }) {
      state.allFormTemplates = state.allFormTemplates.filter(
        (template) => template.form_template_id !== payload
      );

      state.deleteFormTemplateLoading = false;
    },
    createFormTemplate(state) {
      state.createFormTemplateLoading = true;
    },
    createFormTemplateSuccess(state, { payload }) {
      // state.currTemplate = payload;
      // state.allFormTemplates = [...payload, state.allFormTemplates];
      state.createFormTemplateLoading = false;
    },
    getAllFormTemplates(state) {
      state.getAllFormTemplatesLoading = true;
    },
    getAllFormTemplatesSuccess(state, { payload }) {
      state.allFormTemplates = payload;
      state.getAllFormTemplatesLoading = false;
    },
    setCurrFormTemplate(state) {
      state.setCurrFormTemplateLoading = true;
    },
    setCurrFormTemplateSuccess(state, { payload }) {
      state.currTemplate = payload;
      // state.formTemplates = [] find id then replace
      state.setCurrFormTemplateLoading = false;
    },
    updateFormTemplate(state) {
      state.updateFormTemplateLoading = true;
    },
    updateFormTemplateSuccess(state, { payload }) {
      state.currTemplate = payload;
      // state.formTemplates = [] find id then replace
      state.updateFormTemplateLoading = false;
    },
    getAllFormTemplatesName(state) {
      state.getAllFormTemplatesNameLoading = true;
    },
    getAllFormTemplatesNameSuccess(state, { payload }) {
      state.allFormTemplatesName = payload;
      // state.formTemplates = [] find id then replace
      state.getAllFormTemplatesNameLoading = false;
    },
    getFormTemplateById(state) {
      state.getFormTemplateByIdLoading = true;
    },
    getFormTemplateByIdSuccess(state, { payload }) {
      const updatedData = {
        ...payload,
        questions : payload?.questions?.map(c => {
          return {
            ...c,
            options : JSON.parse(c?.options)
          }
        }),
      }

    
      state.currTemplate = updatedData;
      // state.formTemplates = [] find id then replace
      state.getFormTemplateByIdLoading = false;
    },
  },
});

// Export the reducer functions as actions
export const {
  deleteFormTemplate,
  deleteFormTemplateSuccess,
  createFormTemplate,
  createFormTemplateSuccess,
  getAllFormTemplates,
  getAllFormTemplatesSuccess,
  setCurrFormTemplate,
  setCurrFormTemplateSuccess,
  updateFormTemplate,
  updateFormTemplateSuccess,
  getAllFormTemplatesName,
  getAllFormTemplatesNameSuccess,
  getFormTemplateById,
  getFormTemplateByIdSuccess,
} = formTemplateSlice.actions;

export const useSelectAllFormTemplates = () =>
  useSelector((state) => state.formTemplate.allFormTemplates);
export const useSelectCurrTemplate = () =>
  useSelector((state) => state.formTemplate.currTemplate);
export const useSelectAllFormTemplatesName = () =>
  useSelector((state) => state.formTemplate.allFormTemplatesName);

const formTemplateReducer = formTemplateSlice.reducer;

export default formTemplateReducer;
