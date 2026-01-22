import { API } from "@/service/api";
import {
  generateGraphData,
  generateGraphDataError,
  generateGraphDataSuccess,
  saveGraph,
  saveGraphError,
  saveGraphSuccess,
  deleteGraph,
  deleteGraphError,
  deleteGraphSuccess,
  getGraphsBySource,
  getGraphsBySourceError,
  getGraphsBySourceSuccess,
  getGraphByIdSuccess,
  getGraphByIdError,
  getGraphById,
  getPublishedGraphSuccess,
  getPublishedGraphError,
  getPublishedGraph,
  getPublishedGraphByIdSuccess,
  getPublishedGraphByIdError,
  getPublishedGraphById,
} from "../slices/graphSlice";

import { ApiRoute } from "@/enums/api-route";
import { call, delay, put, takeLatest } from "redux-saga/effects";
import { hideToast, showToast } from "../slices/toastSlice";

function* generateGraphDataSaga({ payload }) {
  try {
    const res = yield call(API.get, ApiRoute.graph.generateGraphData, {
      params: payload,
    });

    yield put(generateGraphDataSuccess(res?.data ?? []));
  } catch (error) {
    yield put(
      generateGraphDataError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to generate graph"
      )
    );
  }
}

function* saveGraphSaga({ payload }) {
  const { router, ...otherPayload } = payload;
  try {
    const res = yield call(API.post, ApiRoute.graph.saveGraph, otherPayload);

    // if backend returns saved graph
    router.push(`/graph/${otherPayload.graph_source}/graph-list`);
    yield put(saveGraphSuccess(res?.data));
    yield put(
      showToast({
        message: "Graph saved successfully !",
        status: "success",
      })
    );
    yield delay(2000);
    yield put(hideToast());
  } catch (error) {
    yield put(
      saveGraphError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to save graph"
      )
    );
  }
}

function* getGraphsBySourceSaga({ payload }) {
  try {
    const res = yield call(API.get, ApiRoute.graph.getGraphsBySource, {
      params: payload,
    });

    const data = res?.data;
    yield put(getGraphsBySourceSuccess(data));
  } catch (error) {
    yield put(
      getGraphsBySourceError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch graphs"
      )
    );
  }
}

function* deleteGraphSaga({ payload }) {
  try {
    yield call(API.post, ApiRoute.graph.deleteGraph, payload);

    yield put(
      showToast({
        message: "Graph removed successfully !",
        status: "success"
      })
    );
    yield delay(2000);
    yield put(hideToast());
    yield put(deleteGraphSuccess(payload));
  } catch (error) {
    yield put(
      deleteGraphError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to delete graph"
      )
    );
  }
}

function* getGraphByIdSaga({ payload }) {
  try {
    const res = yield call(API.get, ApiRoute.graph.getGraphById, {
      params: payload,
    });

    const data = res?.data;
    yield put(getGraphByIdSuccess(data));
  } catch (error) {
    yield put(
      getGraphByIdError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch graphs"
      )
    );
  }
}

function* getPublishedGraphSaga({ payload }) {
  try {
    yield put(
      showToast({
        message: "Retrieving data, please wait",
        status: "success",
        loader: true,
      })
    );
    const res = yield call(API.get, ApiRoute.graph.getPublishedGraph, {
      params: payload,
    });

    const data = res?.data;
    yield put(getPublishedGraphSuccess(data));
    yield put(
      showToast({
        message: "Graph loaded successfully !",
        status: "success",
      })
    );
    yield delay(2000);
    yield put(hideToast());
  } catch (error) {
    yield put(
      getPublishedGraphError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch graphs"
      )
    );
  }
}

function* getPublishedGraphByIdSaga({ payload }) {
  try {
    yield put(
      showToast({
        message: "Retrieving data, please wait",
        status: "success",
        loader: true,
      })
    );
    const res = yield call(API.get, ApiRoute.graph.getPublishedGraphById, {
      params: payload,
    });

    const data = res?.data;
    yield put(getPublishedGraphByIdSuccess(data));
    yield put(
      showToast({
        message: "Graph loaded successfully !",
        status: "success",
      })
    );
    yield delay(2000);
    yield put(hideToast());
  } catch (error) {
    yield put(
      getPublishedGraphByIdError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch graphs"
      )
    );
  }
}

export function* graphSaga() {
  yield takeLatest(generateGraphData.type, generateGraphDataSaga);
  yield takeLatest(saveGraph.type, saveGraphSaga);
  yield takeLatest(getGraphsBySource.type, getGraphsBySourceSaga);
  yield takeLatest(deleteGraph.type, deleteGraphSaga);
  yield takeLatest(getGraphById.type, getGraphByIdSaga);
  yield takeLatest(getPublishedGraph.type, getPublishedGraphSaga);
  yield takeLatest(getPublishedGraphById.type, getPublishedGraphByIdSaga);
}
