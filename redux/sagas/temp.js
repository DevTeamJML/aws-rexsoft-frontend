import { takeLatest } from "redux-saga/effects";
import { createClientGroup, getAllClientGroups, removeClientGroup, setClientGroup } from "../slices/clientGroupSlice";

function* getAllClientGroupsSaga() {
  try {
  } catch (error) {}
}

function* createClientGroupSaga() {
  try {
  } catch (error) {}
}

function* setClientGroupSaga() {
  try {
  } catch (error) {}
}

function* removeClientGroupSaga() {
  try {
  } catch (error) {}
}

// Watcher saga
function* clientGroupSaga() {
  yield takeLatest(getAllClientGroups.type, getAllClientGroupsSaga);
  yield takeLatest(createClientGroup.type, createClientGroupSaga);
  yield takeLatest(setClientGroup.type, setClientGroupSaga);
  yield takeLatest(removeClientGroup.type, removeClientGroupSaga);
}

export default clientGroupSaga;
