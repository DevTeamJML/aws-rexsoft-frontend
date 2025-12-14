// redux/sagas/logsSaga.js
import { call, delay, put, takeLatest } from "redux-saga/effects";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";

import {
  createAppointment,
  createAppointmentError,
  createAppointmentSuccess,
  deleteAppointment,
  deleteAppointmentError,
  deleteAppointmentSuccess,
  getAppointment,
  getAppointmentError,
  getAppointmentSuccess,
  updateAppointment,
  updateAppointmentError,
  updateAppointmentSuccess,
} from "../slices/appointmentSlice";
import { hideToast, showToast } from "../slices/toastSlice";

function* getAppointmentSaga({ payload }) {
  try {
    const res = yield call(API.get, ApiRoute.appointment.getAppointments, {
      params: payload,
    });
    const data = res?.data?.data ?? res;
    yield put(
      showToast({
        message: "Appointment retrieved successfully !",
        status: "success",
      })
    );
    // include params so reducer can decide append vs replace
    yield put(getAppointmentSuccess(data));

    yield delay(3000);
    yield put(hideToast());
  } catch (error) {
    console.error("get appointments error:", error);
    yield put(
      getAppointmentError(error.message || "Failed to get appointment")
    );
  }
}

function* updateAppointmentSaga({ payload }) {
  const { clientsPayload, ...otherPayload } = payload;
  try {
    yield call(API.post, ApiRoute.appointment.updateAppointment, otherPayload);
    yield put(
      showToast({
        message: "Update appointment successfully !",
        status: "success",
      })
    );
    yield put(updateAppointmentSuccess(payload));
    yield delay(3000);
    yield put(hideToast());
  } catch (error) {
    yield put(
      updateAppointmentError(error.message || "Failed to update appointment")
    );
  }
}

function* createAppointmentSaga({ payload }) {
  const { clientsPayload, ...otherPayload } = payload;
  try {
    const res = yield call(
      API.post,
      ApiRoute.appointment.createAppointment,
      otherPayload
    );
    yield put(
      showToast({
        message: "Create appointment successfully !",
        status: "success",
      })
    );
    yield put(createAppointmentSuccess(payload));
    yield delay(3000);
    yield put(hideToast());
  } catch (error) {
    yield put(
      createAppointmentError(error.message || "Failed to create appointment")
    );
  }
}

function* deleteAppointmentSaga({ payload }) {
  try {
    const res = yield call(
      API.post,
      ApiRoute.appointment.deleteAppointment,
      payload
    );
    yield put(
      showToast({
        message: "Delete appointment successfully !",
        status: "success",
      })
    );
    yield put(deleteAppointmentSuccess(payload.appointment_id));
    yield delay(3000);
    yield put(hideToast());
  } catch (error) {
    yield put(
      deleteAppointmentError(error.message || "Failed to delete appointment")
    );
  }
}

export function* appointmentSaga() {
  yield takeLatest(getAppointment.type, getAppointmentSaga);
  yield takeLatest(createAppointment.type, createAppointmentSaga);
  yield takeLatest(updateAppointment.type, updateAppointmentSaga);
  yield takeLatest(deleteAppointment.type, deleteAppointmentSaga);
}
