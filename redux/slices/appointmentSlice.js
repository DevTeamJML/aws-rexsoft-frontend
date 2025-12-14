// redux/slices/logsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  appointments: [],
  getAppointmentLoading: false,
  getAppointmentError: "",
  createAppointmentLoading: false,
  createAppointmentError: "",
  updateAppointmentLoading: false,
  updateAppointmentError: "",
  deleteAppointmentLoading: false,
  deleteAppointmentError: "",
};

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    getAppointment(state, { payload }) {
      state.getAppointmentLoading = true;
    },
    getAppointmentSuccess(state, { payload }) {
      state.getAppointmentLoading = false;
      state.appointments = payload;
    },

    getAppointmentError(state, { payload }) {
      state.getAppointmentLoading = false;
      state.getAppointmentError = payload;
    },

    createAppointment(state, { payload }) {
      state.createAppointmentLoading = true;
    },
    createAppointmentSuccess(state, { payload }) {
      state.createAppointmentLoading = false;
      // payload is expected to be the created appointment object
      if (!state.appointments) state.appointments = [];
      const { clientsPayload, ...otherPayload } = payload;
      const updatedPayload = { ...otherPayload, clients: clientsPayload };
      state.appointments.push(updatedPayload);
      // optional: clear any previous error for this flow
      state.createAppointmentError = null;
    },

    createAppointmentError(state, { payload }) {
      state.createAppointmentLoading = false;
      state.createAppointmentError = payload;
    },

    updateAppointment(state, { payload }) {
      state.updateAppointmentLoading = true;
    },
    updateAppointmentSuccess(state, { payload }) {
      state.updateAppointmentLoading = false;
      const { clientsPayload, ...otherPayload } = payload;
      const updatedPayload = { ...otherPayload, clients: clientsPayload };
      if (Array.isArray(state.appointments)) {
        state.appointments = state.appointments.map((a) =>
          String(a.appointment_id) === String(payload.appointment_id)
            ? { ...a, ...updatedPayload }
            : a
        );
      } else {
        state.appointments = [updatedPayload];
      }
      state.updateAppointmentError = null;
    },

    updateAppointmentError(state, { payload }) {
      state.updateAppointmentLoading = false;
      state.updateAppointmentError = payload;
    },
    deleteAppointment(state, { payload }) {
      state.deleteAppointmentLoading = true;
    },
    deleteAppointmentSuccess(state, { payload }) {
      const targetAppointmentId = payload;
      const currAppointment = state.appointments;
      const updatedList = currAppointment.filter(
        (appointment) => appointment.appointment_id !== targetAppointmentId
      );
      state.appointments = updatedList;
      state.deleteAppointmentLoading = false;
    },

    deleteAppointmentError(state, { payload }) {
      state.deleteAppointmentLoading = false;
      state.deleteAppointmentError = payload;
    },
  },
});

export const {
  getAppointment,
  getAppointmentError,
  getAppointmentSuccess,
  createAppointment,
  createAppointmentError,
  createAppointmentSuccess,
  updateAppointment,
  updateAppointmentError,
  updateAppointmentSuccess,
  deleteAppointment,
  deleteAppointmentError,
  deleteAppointmentSuccess,
} = appointmentSlice.actions;

export const useSelectAppointments = () =>
  useSelector((state) => state.appointments.appointments);

const appointmentReducer = appointmentSlice.reducer;
export default appointmentReducer;
