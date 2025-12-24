import { API } from "@/service/api";
import {
  saveKpi,
  saveKpiSuccess,
  saveKpiError,
  deleteKpi,
  deleteKpiSuccess,
  deleteKpiError,
  getKpisBySource,
  getKpisBySourceSuccess,
  getKpisBySourceError,
  getKpiById,
  getKpiByIdSuccess,
  getKpiByIdError,
  getPublishedKpi,
  getPublishedKpiSuccess,
  getPublishedKpiError,
  getPublishedKpiById,
  getPublishedKpiByIdSuccess,
  getPublishedKpiByIdError,
} from "../slices/kpiSlice";

import { ApiRoute } from "@/enums/api-route";
import { call, delay, put, takeLatest } from "redux-saga/effects";
import { hideToast, showToast } from "../slices/toastSlice";

/* =======================
   Save KPI
======================= */
function* saveKpiSaga({ payload }) {
  const { router, ...otherPayload } = payload;

  try {
    const res = yield call(API.post, ApiRoute.kpi.saveKpi, otherPayload);

    router.push(`/kpi/kpi-list`);
    yield put(saveKpiSuccess(res?.data));
    yield put(
      showToast({
        message: "Kpi saved successfully !",
        status: "success",
      })
    );
    yield delay(2000);
    yield put(hideToast());
  } catch (error) {
    yield put(
      saveKpiError(
        error?.response?.data?.message || error.message || "Failed to save KPI"
      )
    );
  }
}

/* =======================
   Get KPIs By Source
======================= */
function* getKpisBySourceSaga({ payload }) {
  try {
    const res = yield call(API.get, ApiRoute.kpi.getKpisBySource, {
      params: payload,
    });

    yield put(getKpisBySourceSuccess(res?.data));
  } catch (error) {
    yield put(
      getKpisBySourceError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch KPIs"
      )
    );
  }
}

/* =======================
   Delete KPI
======================= */
function* deleteKpiSaga({ payload }) {
  try {
    yield call(API.post, ApiRoute.kpi.deleteKpi, payload);

    yield put(
      showToast({
        message: "Kpi removed successfully !",
        status: "success",
      })
    );
    yield delay(2000);
    yield put(hideToast());
    yield put(deleteKpiSuccess(payload)); // usually kpi_id
  } catch (error) {
    yield put(
      deleteKpiError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to delete KPI"
      )
    );
  }
}

/* =======================
   Get KPI By ID
======================= */
function* getKpiByIdSaga({ payload }) {
  try {
    const res = yield call(API.get, ApiRoute.kpi.getKpiById, {
      params: payload,
    });

    yield put(getKpiByIdSuccess(res?.data));
  } catch (error) {
    yield put(
      getKpiByIdError(
        error?.response?.data?.message || error.message || "Failed to fetch KPI"
      )
    );
  }
}

/* =======================
   Get Published KPIs
======================= */
function* getPublishedKpiSaga({ payload }) {
  try {
    yield put(
      showToast({
        message: "Retrieving data, please wait",
        status: "success",
        loader: true,
      })
    );
    const res = yield call(API.get, ApiRoute.kpi.getPublishedKpi, {
      params: payload,
    });

    yield put(getPublishedKpiSuccess(res?.data));
    yield put(
      showToast({
        message: "Kpi loaded successfully !",
        status: "success",
      })
    );
    yield delay(2000);
    yield put(hideToast());
  } catch (error) {
    yield put(
      getPublishedKpiError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch published KPIs"
      )
    );
  }
}

/* =======================
   Get Published KPI By ID
======================= */
function* getPublishedKpiByIdSaga({ payload }) {
  try {
    const res = yield call(API.get, ApiRoute.kpi.getPublishedKpiById, {
      params: payload,
    });

    yield put(getPublishedKpiByIdSuccess(res?.data));
  } catch (error) {
    yield put(
      getPublishedKpiByIdError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch published KPI"
      )
    );
  }
}

/* =======================
   Root KPI Saga
======================= */
export function* kpiSaga() {
  yield takeLatest(saveKpi.type, saveKpiSaga);
  yield takeLatest(getKpisBySource.type, getKpisBySourceSaga);
  yield takeLatest(deleteKpi.type, deleteKpiSaga);
  yield takeLatest(getKpiById.type, getKpiByIdSaga);
  yield takeLatest(getPublishedKpi.type, getPublishedKpiSaga);
  yield takeLatest(getPublishedKpiById.type, getPublishedKpiByIdSaga);
}
