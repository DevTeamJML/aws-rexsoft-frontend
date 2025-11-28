// redux/sagas/logsSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";

import {
  getLogs,
  getLogsSuccess,
  getLogsError,
  getMyLogs,
  getMyLogsSuccess,
  getMyLogsError,
  createLog,
  createLogSuccess,
  createLogError,
  getClientLogsSuccess,
  getClientLogs,
} from "../slices/logSlice";

function* getLogsSaga({ payload }) {
  try {
    const params = payload?.params ?? {};
    const res = yield call(API.get, ApiRoute.logs.list, { params });
    const body = res?.data ?? res ?? { rows: [], total: 0 };
    // include params so reducer can decide append vs replace
    yield put(getLogsSuccess({ ...body, params }));
  } catch (error) {
    console.error("getLogsSaga error:", error);
    yield put(getLogsError(error.message || "Failed to fetch logs"));
  }
}

function* getClientLogsSaga({ payload }) {
  try {
    const params = payload?.params ?? {};
    const res = yield call(API.get, ApiRoute.logs.list, { params });
    const body = res?.data ?? res ?? { rows: [], total: 0 };
    // include params so reducer can decide append vs replace
    yield put(getClientLogsSuccess({ ...body, params }));
  } catch (error) {
    console.error("getLogsSaga error:", error);
    yield put(getLogsError(error.message || "Failed to fetch logs"));
  }
}

function* getMyLogsSaga({ payload }) {
  try {
    const params = payload?.params ?? {};
    const res = yield call(API.get, ApiRoute.logs.me, { params });
    const body = res?.data ?? res ?? { rows: [], total: 0 };
    yield put(getMyLogsSuccess({ ...body, params }));
  } catch (error) {
    console.error("getMyLogsSaga error:", error);
    yield put(getMyLogsError(error.message || "Failed to fetch my logs"));
  }
}

/**
 * createLogSaga
 * payload: { body } // body = log object: { company_id, user_id, section, action, text, metadata, ip_address }
 */
function* createLogSaga({ payload }) {
  try {
    const body = payload?.body ?? payload;
    const res = yield call(API.post, ApiRoute.logs.create, body);
    // server returns created row — pass it to success
    yield put(createLogSuccess(res || res.data || {}));
  } catch (error) {
    console.error("createLogSaga error:", error);
    yield put(createLogError(error.message || "Failed to create log"));
  }
}

export function* logsSaga() {
  yield takeLatest(getLogs.type, getLogsSaga);
  yield takeLatest(getClientLogs.type, getClientLogsSaga);
  yield takeLatest(getMyLogs.type, getMyLogsSaga);
  yield takeLatest(createLog.type, createLogSaga);
}
