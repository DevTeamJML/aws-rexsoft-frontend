import { call, delay, put, takeLatest } from "redux-saga/effects";

import { showToast } from "../slices/toastSlice";
import { updateFormSubmissionApproval, updateFormSubmissionApprovalSuccess } from "../slices/formApprovalSlice";
import { ApiRoute } from "@/enums/api-route";
import { API } from "@/service/api";

function* updateFormSubmissionApprovalSaga({ payload }) {
  try {
    const { data, router } = payload;

    yield call(API.post, ApiRoute.formApproval.updateFormSubmissionApproval, data);

    yield put(updateFormSubmissionApprovalSuccess());

    const msg =
      data.status === "Approved"
        ? "Submission approved successfully"
        : "Submission rejected successfully";

    yield put(showToast({ message: msg, status: "success" }));

    yield delay(800);

    if (router && typeof router.push === "function") {
      router.push("/form/form-approval/form-approval-list");
    }
  } catch (err) {
    console.error("updateFormSubmissionApprovalSaga error:", err);
    yield put(
      showToast({ message: "Failed to update submission", status: "error" })
    );
  }
}

function* formApprovalSaga() {
  yield takeLatest(
    updateFormSubmissionApproval.type,
    updateFormSubmissionApprovalSaga
  );
}

export default formApprovalSaga;
