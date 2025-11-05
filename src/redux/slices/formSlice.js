import { createSlice, current } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  allFormTemplate: [],
  allFormSubmission: [],
  formTemplate: [],
  formSubmission: [],
  retrieveFormSubmissionLoading: false,
  retrieveAllFormTemplateLoading: false,
  createFormTemplateLoading: false,
  retrieveFormTemplateLoading: false,
  updateFormTemplateLoading: false,
  deleteFormTemplateLoading: false,
  createFormSubmission: false,
  retrieveAllFormSubmissionLoading: false,
  updateFormSubmissionLoading: false,
  deleteFormSubmissionLoading: false,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    createFormTemplate(state) {
      state.createFormTemplateLoading = true;
    },

    createFormTemplateSuccess(state) {
      state.createFormTemplateLoading = false;
    },

    retrieveAllFormTemplate(state) {
      state.retrieveAllFormTemplateLoading = true;
    },

    retrieveAllFormTemplateSuccess(state, { payload }) {
      const updatedAllFormTemplate = payload.map((item) => {
        const { questions } = item || {};

        const updatedQuestions = questions.map((item) => {
          return {
            ...item,
            options:
              typeof item.options === "string"
                ? JSON.parse(item.options)
                : item.options,
          };
        });

        return {
          ...item,
          questions: updatedQuestions,
        };
      });

      state.allFormTemplate = updatedAllFormTemplate;
      state.retrieveAllFormTemplateLoading = false;
    },

    retrieveAllFormSubmission(state) {
      state.retrieveAllFormSubmissionLoading = true;
    },

    retrieveAllFormSubmissionSuccess(state, { payload }) {
      state.allFormSubmission = payload;
      state.retrieveAllFormSubmissionLoading = false;
    },

    retrieveFormTemplate(state) {
      state.retrieveFormTemplateLoading = true;
    },

    retrieveFormTemplateSuccess(state, { payload }) {
      state.formTemplate = payload;
      state.retrieveFormTemplateLoading = false;
    },

    retrieveFormSubmission(state) {
      state.retrieveFormSubmissionLoading = true;
    },

    retrieveFormSubmissionSuccess(state, { payload }) {
      const updatedFormSubmission = payload.map((item) => {
        const { form_answers = [] } = item || {};

        const updatedFormAnswer = form_answers.map((item) => {
          return {
            ...item,
            options:
              typeof item.options === "string"
                ? JSON.parse(item.options)
                : item.options,

            answer:
              item.field_type === "number"
                ? parseFloat(item.answer)
                : item.answer,
          };
        });

        return {
          ...item,
          form_answers: updatedFormAnswer,
        };
      });

      state.formSubmission = updatedFormSubmission;
      state.retrieveFormSubmissionLoading = false;
    },

    updateFormTemplate(state) {
      state.updateFormTemplateLoading = true;
    },

    updateFormTemplateSuccess(state, { payload }) {
      state.formTemplate = payload;
      state.updateFormTemplateLoading = false;
    },

    updateFormSubmission(state) {
      state.updateFormSubmissionLoading = true;
    },

    updateFormSubmissionSuccess(state, { payload }) {
      state.formSubmission = payload;
      state.updateFormSubmissionLoading = false;
    },

    deleteFormTemplate(state) {
      state.deleteFormTemplateLoading = true;
    },

    deleteFormTemplateSuccess(state, { payload }) {
      const currentState = current(state.allFormTemplate);

      const updatedData = currentState.filter((form) => {
        return form.form_template_id !== payload;
      });

      state.allFormTemplate = updatedData;
      state.deleteFormTemplateLoading = false;
    },

    deleteFormSubmission(state) {
      state.deleteFormSubmissionLoading = true;
    },

    deleteFormSubmissionSuccess(state, { payload }) {
      const currentState = current(state.allFormSubmission);

      const updatedData = currentState.filter((form) => {
        return form.form_submission_id !== payload;
      });

      state.allFormSubmission = updatedData;
      state.deleteFormSubmissionLoading = false;
    },

    createFormSubmission(state) {
      state.createFormSubmission = true;
    },

    createFormSubmissionSuccess(state) {
      state.createFormSubmission = false;
    },
  },
});

export const {
  createFormTemplate,
  createFormTemplateSuccess,
  retrieveAllFormTemplate,
  retrieveAllFormTemplateSuccess,
  retrieveFormTemplate,
  retrieveFormTemplateSuccess,
  updateFormTemplate,
  updateFormTemplateSuccess,
  deleteFormTemplate,
  deleteFormTemplateSuccess,
  createFormSubmission,
  createFormSubmissionSuccess,
  retrieveAllFormSubmission,
  retrieveAllFormSubmissionSuccess,
  retrieveFormSubmission,
  retrieveFormSubmissionSuccess,
  updateFormSubmission,
  updateFormSubmissionSuccess,
  deleteFormSubmission,
  deleteFormSubmissionSuccess,
} = formSlice.actions;

export const useSelectAllFormTemplate = () =>
  useSelector((state) => state.form.allFormTemplate);
export const useSelectFormTemplate = () =>
  useSelector((state) => state.form.formTemplate);
export const useSelectAllFormSubmission = () =>
  useSelector((state) => state.form.allFormSubmission);
export const useSelectFormSubmission = () =>
  useSelector((state) => state.form.formSubmission);

const formReducer = formSlice.reducer;

export default formReducer;
