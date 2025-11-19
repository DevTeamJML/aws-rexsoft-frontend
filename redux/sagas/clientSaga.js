import { call, delay, put, takeLatest } from "redux-saga/effects";
import {
  bulkCreateClient,
  bulkCreateClientSuccess,
  bulkDeleteClient,
  bulkDeleteClientSuccess,
  bulkUpdateClient,
  createClient,
  deleteClient,
  deleteClientSuccess,
  getAllClients,
  getAllClientsCount,
  getAllClientsCountSuccess,
  getAllClientsSuccess,
  getClientDataByClientId,
  getClientDataByClientIdSuccess,
  handleOnChangeClientGroup,
  setSelectedClientGroupIdSuccess,
  setSelectedClientGroupSuccess,
  setSelectedClientIds,
  setSelectedClientIdsSuccess,
  updateClient,
} from "../slices/clientSlice";
import { addToLocalStorage } from "@/utils/localStorage";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";
import { hideToast, showToast } from "../slices/toastSlice";
import { setShowModal } from "../slices/confirmModalSlice";

function* handleOnChangeClientGroupSaga({ payload }) {
  try {
    const { client_group_id, targetGroup } = payload;

    addToLocalStorage(process.env.CURR_SELECTED_GROUP_ID, client_group_id);
    yield put(setSelectedClientGroupIdSuccess(client_group_id));
    yield put(setSelectedClientGroupSuccess({ ...targetGroup }));
    window.location.reload();
  } catch (error) {
    console.log(error);
  }
}

function* bulkCreateClientSaga({ payload }) {
  const { router, setImportedData, ...otherData } = payload;
  try {
    yield put(
      showToast({
        message: "Processing data, please wait..",
        status: "success",
        loader: true,
      })
    );
    yield delay(1000);
    yield call(API.post, ApiRoute.client.bulkCreateClient, otherData);
    yield put(bulkCreateClientSuccess());
    setImportedData(null);
    yield put(
      showToast({
        message: "Data imported successfully !",
        status: "success",
      })
    );
    yield delay(3000);
    yield put(hideToast());
    // router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* createClientSaga({ payload }) {
  const { router, ...otherData } = payload;
  try {
    yield call(API.post, ApiRoute.client.create, otherData.payload);
    router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* updateClientSaga({ payload }) {
  const { router, ...otherData } = payload;
  try {
    yield call(API.post, ApiRoute.client.update, otherData.payload);
    router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* getAllClientsSaga({ payload }) {
  try {
    const response = yield call(API.post, ApiRoute.client.get, payload);
    const clientList = response.data;
    yield put(getAllClientsSuccess(clientList));
  } catch (error) {
    console.log(error);
  }
}

function* getAllClientsCountSaga({ payload }) {
  try {
    const response = yield call(
      API.post,
      ApiRoute.client.getAllClientsCount,
      payload
    );
    const clientCount = response.data;

    yield put(getAllClientsCountSuccess(clientCount));
  } catch (error) {
    console.log(error);
  }
}

function* getClientDataByClientIdSaga({ payload }) {
  try {
    const response = yield call(
      API.post,
      ApiRoute.client.getClientDataByClientId,
      payload
    );
    const clientList = response.data;

    yield put(getClientDataByClientIdSuccess(clientList));
  } catch (error) {
    console.log(error);
  }
}
function* setSelectedClientIdsSaga({ payload }) {
  try {
    const { router, data } = payload;
    yield put(setSelectedClientIdsSuccess(data));
    router.push("/client/client-list/bulk-update");
  } catch (error) {
    console.log(error);
  }
}

function* bulkUpdateClientSaga({ payload }) {
  try {
    const { router, ...otherData } = payload;

    yield call(API.post, ApiRoute.client.bulkUpdate, otherData.payload);

    // yield put(
    //   showToast({
    //     message: "Processing data, please wait..",
    //     status: "success",
    //     loader: true,
    //   })
    // );

    // // yield put(router.push("/client/client-list"));
    // yield put(hideToast());
  } catch (error) {
    console.log(error);
    yield put(
      showToast({
        message: "Bulk update failed",
        status: "error",
      })
    );
  }
}

function* deleteClientSaga({ payload }) {
  try {
    const { client_id, client_group_id } = payload;
    yield call(API.post, ApiRoute.client.delete, {
      client_id,
      client_group_id,
    });
    yield put(deleteClientSuccess(client_id));
    yield put(setShowModal(false));
    yield put(
      showToast({
        message: "Delete client successfully !",
        status: "success",
      })
    );
    yield delay(3000);
    yield put(hideToast());
    // router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* bulkDeleteClientSaga({ payload }) {
  try {
    const { client_id_list, client_group_id } = payload;
    yield call(API.post, ApiRoute.client.bulkDelete, payload);
    yield put(bulkDeleteClientSuccess(client_id_list));
    yield put(setShowModal(false));
    // router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

// Watcher saga
function* clientSaga() {
  yield takeLatest(
    handleOnChangeClientGroup.type,
    handleOnChangeClientGroupSaga
  );
  yield takeLatest(bulkCreateClient.type, bulkCreateClientSaga);
  yield takeLatest(createClient.type, createClientSaga);
  yield takeLatest(getAllClients.type, getAllClientsSaga);
  yield takeLatest(updateClient.type, updateClientSaga);
  yield takeLatest(setSelectedClientIds.type, setSelectedClientIdsSaga);
  yield takeLatest(bulkUpdateClient.type, bulkUpdateClientSaga);
  yield takeLatest(deleteClient.type, deleteClientSaga);
  yield takeLatest(bulkDeleteClient.type, bulkDeleteClientSaga);
  yield takeLatest(getClientDataByClientId.type, getClientDataByClientIdSaga);
  yield takeLatest(getAllClientsCount.type, getAllClientsCountSaga);
}

export default clientSaga;
