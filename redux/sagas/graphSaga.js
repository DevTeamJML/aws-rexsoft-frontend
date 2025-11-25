import { API } from "@/service/api";
import { generateGraphData, generateGraphDataError, generateGraphDataSuccess } from "../slices/graphSlice";
import { ApiRoute } from "@/enums/api-route";
import { call, put, takeLatest } from "redux-saga/effects";

function* generateGraphDataSaga({ payload }) {
  try {
    const data = yield call(API.get, ApiRoute.graph.generateGraphData, {
        params : payload
    });
    
    yield put(generateGraphDataSuccess(data));
  } catch (error) {
    console.error("Error generating graph data:", error);
    yield put(generateGraphDataError(error.message || "Failed to generate graph"));
  }
}

export function* graphSaga() {
  yield takeLatest(generateGraphData.type, generateGraphDataSaga);
}