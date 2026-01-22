// sagas/formSubmissionSaga.js
import { call, delay, put, takeLatest } from "redux-saga/effects";
import {
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
  handleOnChangeFormSubmissionGroup,
  handleOnChangeFormSubmissionGroupSuccess,
  getUserFormSubmissionSuccess,
  getUserFormSubmission,
} from "../slices/formSubmissionSlice";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";
import { showToast } from "../slices/toastSlice";
import { setShowModal } from "../slices/confirmModalSlice";

function* getUserFormSubmissionsSaga({ payload }) {
  try {
    const params = payload || {};
    const response = yield call(
      API.get,
      ApiRoute.formSubmission.getUserFormSubmission,
      { params }
    );
    const data = response.data;
    // tolerate two common shapes: { items, pagination } or array
    yield put(
      getUserFormSubmissionSuccess({
        data: data.submissions ?? data,
        counts: data.counts ?? data,
      })
    );
  } catch (error) {
    console.error("getAllFormSubmissionsSaga error:", error);
    // optional: yield put(showToast({ message: 'Failed to fetch submissions', status: 'error' }));
  }
}

/* Get all form submissions (with optional params: pagination, company_id, group_id, filters) */
function* getAllFormSubmissionsSaga({ payload }) {
  try {
    const params = payload || {};
    const response = yield call(
      API.get,
      ApiRoute.formSubmission.getAllFormSubmissions,
      { params }
    );
    const data = response.data;
    // tolerate two common shapes: { items, pagination } or array
    yield put(
      getAllFormSubmissionsSuccess({
        data: data.submissions ?? data,
        counts: data.counts ?? data,
        // pagination: data.pagination ?? {},
      })
    );
  } catch (error) {
    console.error("getAllFormSubmissionsSaga error:", error);
    // optional: yield put(showToast({ message: 'Failed to fetch submissions', status: 'error' }));
  }
}

/* Create a new form submission */
function* createFormSubmissionSaga({ payload }) {
  try {
    // payload expected: { data, router? }
    const { router, data } = payload || {};
    yield call(API.post, ApiRoute.formSubmission.createFormSubmission, data);
    yield put(createFormSubmissionSuccess());
    yield put(
      showToast({ message: "Form submission created", status: "success" })
    );
    yield delay(800);
    // optional navigation
    if (router && typeof router.push === "function") {
      router.push("/form/form-submission/apply-form-list");
    }
    // optional: refresh list
    // yield put(getAllFormSubmissions({ company_id: data.company_id }));
  } catch (error) {
    console.error("createFormSubmissionSaga error:", error);
    yield put(
      showToast({ message: "Failed to create submission", status: "error" })
    );
  }
}

function* updateFormSubmissionSaga({ payload }) {
  try {
    const { data, router } = payload || {};
    yield call(API.post, ApiRoute.formSubmission.updateFormSubmission, data); // change if you add update endpoint
    yield put(updateFormSubmissionSuccess());
    yield put(
      showToast({ message: "Form submission updated", status: "success" })
    );
    yield delay(800);
    if (router && typeof router.push === "function") {
      router.push("/form/form-submission/form-submission-list");
    }
    // optionally refresh detail
    // yield put(getFormSubmissionById({ form_submission_id: data.form_submission_id }));
  } catch (error) {
    console.error("updateFormSubmissionSaga error:", error);
    yield put(
      showToast({ message: "Failed to update submission", status: "error" })
    );
  }
}

/* Delete a form submission */
function* deleteFormSubmissionSaga({ payload }) {
  try {
    // payload: { form_submission_id, setTargetId?, extraParams? }
    const { form_submission_id, setTargetId } = payload || {};
    yield call(API.post, ApiRoute.formSubmission.deleteFormSubmission, {
      form_submission_id,
    });
    if (typeof setTargetId === "function") {
      setTargetId("");
    }
    yield put(deleteFormSubmissionSuccess(form_submission_id));
    yield put(
      showToast({ message: "Deleted successfully!", status: "success" })
    );
    yield put(setShowModal(false));
    yield delay(2000);

    // optionally refresh list
    // yield put(getAllFormSubmissions());
  } catch (error) {
    console.error("deleteFormSubmissionSaga error:", error);
    yield put(
      showToast({ message: "Failed to delete submission", status: "error" })
    );
  }
}

/* Get a single form submission by id */
function* getFormSubmissionByIdSaga({ payload }) {
  try {
    const { form_submission_id } = payload || {};
    const response = yield call(
      API.get,
      ApiRoute.formSubmission.getFormSubmissionById,
      {
        params: { form_submission_id },
      }
    );
    const data = response.data;
    yield put(getFormSubmissionByIdSuccess(data));
  } catch (error) {
    console.error("getFormSubmissionByIdSaga error:", error);
    // optional toast
    // yield put(showToast({ message: 'Failed to fetch submission', status: 'error' }));
  }
}


function* handleOnChangeFormSubmissionGroupSaga({ payload }) {
  try {
    const groupId = payload?.group_id ?? payload;
    yield put(handleOnChangeFormSubmissionGroupSuccess(groupId));
    if (groupId) {
      const response = yield call(
        API.get,
        ApiRoute.formSubmission.getAllFormSubmissions,
        {
          params: { group_id: groupId },
        }
      );
      const data = response.data;
      yield put(
        getAllFormSubmissionsSuccess({
          data: data.items ?? data,
          pagination: data.pagination ?? {},
        })
      );
    }
  } catch (error) {
    console.error("handleOnChangeFormSubmissionGroupSaga error:", error);
  }
}

/* Watcher saga */
function* formSubmissionSaga() {
  yield takeLatest(getUserFormSubmission.type, getUserFormSubmissionsSaga);
  yield takeLatest(getAllFormSubmissions.type, getAllFormSubmissionsSaga);
  yield takeLatest(createFormSubmission.type, createFormSubmissionSaga);
  yield takeLatest(updateFormSubmission.type, updateFormSubmissionSaga);
  yield takeLatest(deleteFormSubmission.type, deleteFormSubmissionSaga);
  yield takeLatest(getFormSubmissionById.type, getFormSubmissionByIdSaga);
  yield takeLatest(
    handleOnChangeFormSubmissionGroup.type,
    handleOnChangeFormSubmissionGroupSaga
  );
}

export default formSubmissionSaga;
