import { call, delay, put, takeLatest } from "redux-saga/effects";
import {
  createClientGroup,
  deleteClientGroup,
  deleteClientGroupSuccess,
  getAllClientGroups,
  getAllClientGroupsName,
  getAllClientGroupsNameSuccess,
  getAllClientGroupsSuccess,
  getSelectedClientGroup,
  getSelectedClientGroupSuccess,
  updateClientGroup,
} from "../slices/clientGroupSlice";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";
import { setShowModal } from "../slices/confirmModalSlice";
import { ref, remove, set } from "firebase/database";
import { db } from "@/config/firebaseConfig";
import {
  setSelectedClientGroupIdSuccess,
  setSelectedClientGroupSuccess,
} from "../slices/clientSlice";
import { hideToast, showToast } from "../slices/toastSlice";

function* deleteClientGroupSaga({ payload }) {
  try {
    const { client_group_id, setTargetGroupId, company_id } = payload;
    yield call(API.delete, ApiRoute.clientGroup.deleteClientGroupById, {
      params: {
        client_group_id: client_group_id,
      },
    });
    setTargetGroupId("");
    yield put(deleteClientGroupSuccess(client_group_id));
    yield call(remove, ref(db, `ColumnSorting/${client_group_id}/`));
    yield put(
      showToast({
        message: "Delete successfully !",
        status: "success"
      })
    );
    yield delay(1000);
    // yield put(getAllClientGroups({company_id}))
    yield put(setShowModal(false));
  } catch (error) {
    console.log(error);
  }
}

function* getAllClientGroupsSaga({ payload }) {
  try {
    const { company_id } = payload;
    if (company_id) {
      const response = yield call(
        API.get,
        ApiRoute.clientGroup.getAllClientGroups,
        {
          params: { company_id: company_id },
        }
      );
      const groupList = response.data;
      yield put(getAllClientGroupsSuccess(groupList));
    }
  } catch (error) {
    console.log(error);
  }
}

function* createClientGroupSaga({ payload }) {
  try {
    const { data, router } = payload;
    const client_group_id = data.client_group_id;
    const columns = data.columns;
    const columnIdList = columns.map((col) => {
      return col.column_id;
    });
    yield call(API.post, ApiRoute.clientGroup.create, data);
    yield call(set, ref(db, `ColumnSorting/${client_group_id}/`), columnIdList);
    yield delay(1000);
    router.push("/client/client-group-list");
    // yield put(createClientGroupSuccess(payload));
  } catch (error) {
    console.error(error);
  }
}

function* updateClientGroupSaga({ payload }) {
  try {
    const { data, router } = payload;
    const client_group_id = data.client_group_id;
    const columns = data.columns;
    const columnIdList = columns.map((col) => {
      return col.column_id;
    });
    yield call(API.post, ApiRoute.clientGroup.updateClientGroup, data);
    yield call(set, ref(db, `ColumnSorting/${client_group_id}/`), columnIdList);
    yield delay(1000);
    router.push("/client/client-group-list");
  } catch (error) {
    console.error(error);
  }
}

function* getAllClientGroupsNameSaga({ payload }) {
  try {
    const { company_id } = payload;
    const response = yield call(
      API.get,
      ApiRoute.clientGroup.getAllClientGroupsName,
      {
        params: { company_id: company_id },
      }
    );
    const groupList = response.data;
    yield put(getAllClientGroupsNameSuccess(groupList));
  } catch (error) {
    console.log(error);
  }
}

function* getSelectedClientGroupSaga({ payload }) {
  try {
    const { client_group_id } = payload;
    const response = yield call(
      API.get,
      ApiRoute.clientGroup.getSelectedClientGroup,
      {
        params: { client_group_id: client_group_id },
      }
    );
    const selectedGroup = response.data;
    yield put(setSelectedClientGroupIdSuccess(client_group_id));
    yield put(setSelectedClientGroupSuccess(selectedGroup));
    yield put(getSelectedClientGroupSuccess(selectedGroup));
  } catch (error) {
    console.log(error);
  }
}

// Watcher saga
function* clientGroupSaga() {
  yield takeLatest(getAllClientGroups.type, getAllClientGroupsSaga);
  yield takeLatest(createClientGroup.type, createClientGroupSaga);
  yield takeLatest(updateClientGroup.type, updateClientGroupSaga);
  yield takeLatest(deleteClientGroup.type, deleteClientGroupSaga);
  yield takeLatest(getAllClientGroupsName.type, getAllClientGroupsNameSaga);
  yield takeLatest(getSelectedClientGroup.type, getSelectedClientGroupSaga);
}

export default clientGroupSaga;
