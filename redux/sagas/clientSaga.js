import { call, delay, put, takeLatest } from "redux-saga/effects";
import {
  archiveClient,
  archiveClientSuccess,
  bulkArchiveClient,
  bulkArchiveClientSuccess,
  bulkCreateClient,
  bulkCreateClientSuccess,
  bulkDeleteClient,
  bulkDeleteClientSuccess,
  bulkRestoreClient,
  bulkRestoreClientSuccess,
  bulkUpdateClient,
  createClient,
  deleteClient,
  deleteClientSuccess,
  duplicateCheckFailure,
  duplicateCheckRequest,
  duplicateCheckSuccess,
  getAllClients,
  getAllClientsCount,
  getAllClientsCountSuccess,
  getAllClientsSuccess,
  getClientDataByClientId,
  getClientDataByClientIdSuccess,
  handleOnChangeClientGroup,
  restoreClient,
  restoreClientSuccess,
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
  const { router, setImportedData, logsBody, ...otherData } = payload;
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
    yield put(
      showToast({
        message: "Import client successfully !",
        status: "success",
        loader: true
      })
    );
    yield delay(2000);
    yield put(hideToast());
    yield put(bulkCreateClientSuccess());
    setImportedData(null);
    yield call(API.post, ApiRoute.logs.create, logsBody);
    yield put(
      showToast({
        message: "Data imported successfully !",
        status: "success",
        loader: true
      })
    );
    yield delay(2000);
    yield put(hideToast());
    // router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* createClientSaga({ payload }) {
  const { router, logsBody, ...otherData } = payload;
  try {
    yield put(
      showToast({
        message: "Processing data, please wait..",
        status: "success",
        loader: true,
      })
    );
    yield delay(1000);
    yield call(API.post, ApiRoute.client.create, otherData.payload);

    yield call(API.post, ApiRoute.logs.create, logsBody);
    yield put(
      showToast({
        message: "Create client successfully !",
        status: "success",
        loader: true
      })
    );
    yield delay(2000);
    router.push("/client/client-list");
    yield put(hideToast());
  } catch (error) {
    console.log(error);
  }
}

function* updateClientSaga({ payload }) {
  const { router, logsBody, ...otherData } = payload;
  try {
    yield put(
      showToast({
        message: "Processing data, please wait..",
        status: "success",
        loader: true,
      })
    );
    yield delay(1000);
    yield call(API.post, ApiRoute.client.update, otherData.payload);
    yield call(API.post, ApiRoute.logs.create, logsBody);
    yield put(
      showToast({
        message: "Update client successfully !",
        status: "success",
        loader: true
      })
    );
    yield delay(2000);
    router.push("/client/client-list");
    yield put(hideToast());
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
    const { router, logsBody, ...otherData } = payload;

    yield call(API.post, ApiRoute.client.bulkUpdate, otherData.payload);
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
        loader: true
      })
    );
    yield delay(2000);
    yield put(hideToast());
    // router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* bulkDeleteClientSaga({ payload }) {
  try {
    const { clientPayload, ...otherPayload } = payload;
    yield call(API.post, ApiRoute.client.bulkDelete, otherPayload);
    yield put(getAllClients({ ...clientPayload }));
    // yield put(bulkDeleteClientSuccess(client_id_list));
    yield put(setShowModal(false));
    yield put(
      showToast({
        message: "Delete client successfully !",
        status: "success",
        loader: true
      })
    );
    yield delay(2000);
    yield put(hideToast());
    // router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* handleDuplicateCheckSaga(action) {
  try {
    const { request, cb } = action.payload || {};
    if (!request) throw new Error("Missing request payload");

    // call API (returns { isDuplicate: boolean })
    const result = yield call(API.get, ApiRoute.client.checkDuplicate, {
      params: {
        ...request,
      },
    });

    // put result into store
    yield put(duplicateCheckSuccess(result));

    // fire callback if provided
    if (typeof cb === "function") cb(null, result);
  } catch (err) {
    const error = err?.message || "Duplicate check failed";
    yield put(duplicateCheckFailure(error));
    if (action.payload && typeof action.payload.cb === "function") {
      action.payload.cb(error, null);
    }
  }
}

function* archiveClientSaga({ payload }) {
  try {
    const { client_id, client_group_id } = payload;
    yield call(API.post, ApiRoute.client.archive, {
      client_id,
      client_group_id,
    });
    yield put(archiveClientSuccess(client_id));
    yield put(setShowModal(false));
    yield put(
      showToast({
        message: "Archive client successfully !",
        status: "success",
        loader: true
      })
    );
    yield delay(2000);
    yield put(hideToast());
    // router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* bulkArchiveClientSaga({ payload }) {
  try {
    const { clientPayload, ...otherPayload } = payload;
    yield call(API.post, ApiRoute.client.bulkArchive, otherPayload);
    yield put(getAllClients({ ...clientPayload }));
    // yield put(bulkArchiveClientSuccess(otherPayload.client_id_list));
    yield put(setShowModal(false));
    yield put(
      showToast({
        message: "Archive client successfully !",
        status: "success",
        loader: true
      })
    );
    yield delay(2000);
    yield put(hideToast());
    // router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* restoreClientSaga({ payload }) {
  try {
    const { client_id, client_group_id } = payload;
    yield call(API.post, ApiRoute.client.restore, {
      client_id,
      client_group_id,
    });
    yield put(restoreClientSuccess(client_id));
    yield put(setShowModal(false));
    yield put(
      showToast({
        message: "Restore client successfully !",
        status: "success",
        loader: true
      })
    );
    yield delay(2000);
    yield put(hideToast());
    // router.push("/client/client-list");
  } catch (error) {
    console.log(error);
  }
}

function* bulkRestoreClientSaga({ payload }) {
  try {
    const { clientPayload, ...otherPayload } = payload;
    yield call(API.post, ApiRoute.client.bulkRestore, otherPayload);
    yield put(getAllClients({ ...clientPayload }));
    // yield put(bulkRestoreClientSuccess(otherPayload.client_id_list));
    yield put(
      showToast({
        message: "Restore client successfully !",
        status: "success",
        loader: true
      })
    );
    yield delay(2000);
    yield put(hideToast());
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
  yield takeLatest(archiveClient.type, archiveClientSaga);
  yield takeLatest(bulkArchiveClient.type, bulkArchiveClientSaga);
  yield takeLatest(restoreClient.type, restoreClientSaga);
  yield takeLatest(bulkRestoreClient.type, bulkRestoreClientSaga);

  yield takeLatest(getClientDataByClientId.type, getClientDataByClientIdSaga);
  yield takeLatest(getAllClientsCount.type, getAllClientsCountSaga);
  yield takeLatest(duplicateCheckRequest.type, handleDuplicateCheckSaga);
}

export default clientSaga;
