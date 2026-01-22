import { ApiRoute } from "@/enums/api-route";
import { API } from "@/service/api";
import { call, put, takeLatest } from "redux-saga/effects";
import { getDashboard, getDashboardFailure, getDashboardSuccess } from "../slices/dashboardSlice";


function* handleGetDashboardSaga({ payload }) {
  try {
    const res = yield call(API.get, ApiRoute.dashboard.getDashboard, {
      params: payload,
    });
    console.log("TEST : ", res)
    yield put(getDashboardSuccess(res.data));
  } catch (err) {
    yield put(getDashboardFailure());
  }
}

export function* dashboardSaga() {
  yield takeLatest(getDashboard.type, handleGetDashboardSaga);
}

