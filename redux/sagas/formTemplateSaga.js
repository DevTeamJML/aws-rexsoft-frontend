// sagas/formTemplateSaga.js
import { call, delay, put, takeLatest } from "redux-saga/effects";
import {
  createFormTemplate,
  createFormTemplateSuccess,
  deleteFormTemplate,
  deleteFormTemplateSuccess,
  getAllFormTemplates,
  getAllFormTemplatesName,
  getAllFormTemplatesNameSuccess,
  getAllFormTemplatesSuccess,
  getFormTemplateById,
  getFormTemplateByIdSuccess,
  updateFormTemplate,
  updateFormTemplateSuccess,
} from "../slices/formTemplateSlice";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";
import { setShowModal } from "../slices/confirmModalSlice";
import { ref, remove, set } from "firebase/database";
import { db } from "@/config/firebaseConfig";

import { hideToast, showToast } from "../slices/toastSlice";

function* deleteFormTemplateSaga({ payload }) {
  try {
    const { form_template_id, setTargetFormId, company_id } = payload;
    // using your provided ApiRoute key: deleteFromTemplate
    yield call(API.post, ApiRoute.formTemplate.deleteFromTemplate, {
      form_template_id: form_template_id,
    });
    if (typeof setTargetFormId === "function") {
      setTargetFormId("");
    }
    yield put(deleteFormTemplateSuccess(form_template_id));
    // optional: remove firebase column sorting
    // yield call(remove, ref(db, `ColumnSorting/${form_template_id}/`));
    yield put(
      showToast({
        message: "Delete successfully!",
        status: "success",
      })
    );
    yield delay(1000);
    // optionally refresh list: yield put(getAllFormTemplates({ company_id }));
    yield put(setShowModal(false));
  } catch (error) {
    console.error("deleteFormTemplateSaga error:", error);
    yield put(
      showToast({
        message: "Failed to delete form template",
        status: "error",
      })
    );
  }
}

function* getAllFormTemplatesSaga({ payload }) {
  try {
    const { company_id } = payload || {};
    if (company_id) {
      // using your provided ApiRoute key: getAllFormTemplates
      const response = yield call(
        API.get,
        ApiRoute.formTemplate.getAllFormTemplates,
        {
          params: { company_id },
        }
      );
      const templateList = response.data;
      yield put(getAllFormTemplatesSuccess(templateList));
    }
  } catch (error) {
    console.error("getAllFormTemplatesSaga error:", error);
    yield put(
      showToast({
        message: "Failed to fetch form templates",
        status: "error",
      })
    );
  }
}

/* If you still use a "names only" endpoint, call getAllFormTemplatesName.
   If not, this saga will call getAllFormTemplates (same endpoint) so it still returns something useful. */
function* getAllFormTemplatesNameSaga({ payload }) {
  try {
    const { company_id } = payload || {};
    // If your backend has a separate name-only endpoint, change this key accordingly.
    // Using getAllFormTemplates as a fallback to return the list.
    const response = yield call(
      API.get,
      ApiRoute.formTemplate.getAllFormTemplates,
      {
        params: { company_id },
      }
    );
    const templateList = response.data;
    yield put(getAllFormTemplatesNameSuccess(templateList));
  } catch (error) {
    console.error("getAllFormTemplatesNameSaga error:", error);
  }
}

function* createFormTemplateSaga({ payload }) {
  try {
    const { data, router } = payload || {};
    const form_template_id = data?.form_template_id;
    // use createFormTemplate route
    yield call(API.post, ApiRoute.formTemplate.createFormTemplate, data);
    // optional: store column order in firebase
    // const columns = data.columns || [];
    const questionIdList = data.questions.map((col) => col.form_question_id);
    yield call(
      set,
      ref(db, `FormSorting/${form_template_id}/`),
      questionIdList
    );
    yield put(
      showToast({
        message: "Form template created",
        status: "success",
      })
    );
    yield delay(1000);
    if (router && typeof router.push === "function") {
      router.push("/form/form-template/form-template-list");
    }
    yield put(createFormTemplateSuccess(payload)); // if you want to dispatch success action
  } catch (error) {
    console.error("createFormTemplateSaga error:", error);
    yield put(
      showToast({
        message: "Failed to create form template",
        status: "error",
      })
    );
  }
}

function* updateFormTemplateSaga({ payload }) {
  try {
    const { data, router } = payload || {};
    const form_template_id = data?.form_template_id;
    // call update route
    yield call(API.post, ApiRoute.formTemplate.updateFormTemplate, data);
    // optional firebase update:
    // const columns = data.columns || [];
    const questionIdList = data.questions.map((col) => col.form_question_id);
    yield call(
      set,
      ref(db, `FormSorting/${form_template_id}/`),
      questionIdList
    );
    yield put(
      showToast({
        message: "Form template updated",
        status: "success",
      })
    );
    yield delay(1000);
    if (router && typeof router.push === "function") {
      router.push("/form/form-template/form-template-list");
    }
    yield put(updateFormTemplateSuccess(payload));
  } catch (error) {
    console.error("updateFormTemplateSaga error:", error);
    yield put(
      showToast({
        message: "Failed to update form template",
        status: "error",
      })
    );
  }
}

function* getFormTemplateByIdSaga({ payload }) {
  try {
    const { form_template_id } = payload || {};
    // using getFormTemplateById key
    const response = yield call(
      API.get,
      ApiRoute.formTemplate.getFormTemplateById,
      {
        params: { form_template_id },
      }
    );
    const selectedGroup = response.data;
    yield put(getFormTemplateByIdSuccess(selectedGroup));
  } catch (error) {
    console.error("getFormTemplateByIdSaga error:", error);
    yield put(
      showToast({
        message: "Failed to fetch template by id",
        status: "error",
      })
    );
  }
}

// Watcher saga
function* formTemplateSaga() {
  yield takeLatest(getAllFormTemplates.type, getAllFormTemplatesSaga);
  yield takeLatest(createFormTemplate.type, createFormTemplateSaga);
  yield takeLatest(updateFormTemplate.type, updateFormTemplateSaga);
  yield takeLatest(deleteFormTemplate.type, deleteFormTemplateSaga);
  yield takeLatest(getAllFormTemplatesName.type, getAllFormTemplatesNameSaga);
  yield takeLatest(getFormTemplateById.type, getFormTemplateByIdSaga);
}

export default formTemplateSaga;
