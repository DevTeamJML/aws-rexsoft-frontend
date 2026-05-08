import { takeLatest, put, call, delay } from "redux-saga/effects";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";

import {
  getAllLeader,
  getAllLeaderSuccess,
  assignLeader,
  assignLeaderSuccess,
  updateLeader,
  updateLeaderSuccess,
  deleteLeader,
  deleteLeaderSuccess,
} from "../slices/leaderSlice";
import { hideToast, showToast } from "../slices/toastSlice";

function* getAllLeaderSaga({ payload }) {
  const { company_id = "" } = payload;

  try {
    const response = yield call(API.post, ApiRoute.leader.getAllLeader, {
      company_id,
    });

    yield put(getAllLeaderSuccess(response.data));
  } catch (err) {
    console.error("Fetch leader error :", err);
  }
}

function* assignLeaderSaga({ payload }) {
  const { company_id = "" } = payload;

  try {
    yield call(API.post, ApiRoute.leader.assignLeader, payload);

    yield put(
      getAllLeader({
        company_id,
      }),
    );

    yield put(
      showToast({
        message: "Assign leader successfully",
        status: "success",
      }),
    );

    yield delay(1500);
    yield put(hideToast());
  } catch (err) {
    console.error("Assign leader error :", err);
  }
}

function* updateLeaderSaga({ payload }) {
  const { company_id = "" } = payload;

  try {
    yield call(API.post, ApiRoute.leader.updateLeader, payload);

    yield put(
      getAllLeader({
        company_id,
      }),
    );

    yield put(
      showToast({
        message: "Update leader successfully",
        status: "success",
      }),
    );

    yield delay(1500);
    yield put(hideToast());
  } catch (err) {
    console.error("Update leader error :", err);
  }
}

function* deleteLeaderSaga({ payload }) {
  try {
    const response = yield call(
      API.post,
      ApiRoute.leader.deleteLeader,
      payload,
    );

    yield put(deleteLeaderSuccess(response.data));
  } catch (err) {
    console.error("Delete leader error :", err);
  }
}

function* leaderSaga() {
  yield takeLatest(getAllLeader.type, getAllLeaderSaga);
  yield takeLatest(assignLeader.type, assignLeaderSaga);
  yield takeLatest(updateLeader.type, updateLeaderSaga);
  yield takeLatest(deleteLeader.type, deleteLeaderSaga);
}

export default leaderSaga;
