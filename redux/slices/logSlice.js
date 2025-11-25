// redux/slices/logsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  logs: [], // array of log rows
  total: 0, // total count from server (for pagination)
  loading: false, // loading for getLogs / getMyLogs
  error: "",

  creating: false, // creating a log entry
  createError: "",
};

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    // Get logs (company / filtered)
    getLogs(state, { payload }) {
      state.loading = true;
      state.error = "";
    },
    getLogsSuccess(state, { payload }) {
      const rows = payload.rows || [];
      const total = payload.total ?? 0;
      const offset = payload.params?.offset ?? 0;
      if (offset > 0) {
        // append
        state.logs = [...(state.logs || []), ...rows];
      } else {
        // replace
        state.logs = rows;
      }
      state.total = total;
      state.loading = false;
    },

    getLogsError(state, { payload }) {
      state.error = payload;
      state.loading = false;
    },

    // Get current user's logs
    getMyLogs(state, { payload }) {
      state.loading = true;
      state.error = "";
    },
    // in getLogsSuccess and getMyLogsSuccess handlers, expect payload like { rows, total, params? }

    getMyLogsSuccess(state, { payload }) {
      const rows = payload.rows || [];
      const total = payload.total ?? 0;
      const offset = payload.params?.offset ?? 0;
      if (offset > 0) {
        state.logs = [...(state.logs || []), ...rows];
      } else {
        state.logs = rows;
      }
      state.total = total;
      state.loading = false;
    },

    getMyLogsError(state, { payload }) {
      state.error = payload;
      state.loading = false;
    },

    // Create log
    createLog(state, { payload }) {
      state.creating = true;
      state.createError = "";
    },
    createLogSuccess(state, { payload }) {
      // optional: prepend into logs list for immediate UI feedback
      state.creating = false;
      // if payload includes row, optionally add it
      if (payload && payload.log_id) {
        state.logs = [payload, ...state.logs];
        state.total = (state.total || 0) + 1;
      }
    },
    createLogError(state, { payload }) {
      state.creating = false;
      state.createError = payload;
    },

    // Clear logs state if needed
    clearLogsState(state) {
      return initialState;
    },
  },
});

export const {
  getLogs,
  getLogsSuccess,
  getLogsError,
  getMyLogs,
  getMyLogsSuccess,
  getMyLogsError,
  createLog,
  createLogSuccess,
  createLogError,
  clearLogsState,
} = logsSlice.actions;

// Selectors — pattern used in your repo (hooks using useSelector)
export const useSelectLogs = () => useSelector((state) => state.logs.logs);
export const useSelectLogsTotal = () =>
  useSelector((state) => state.logs.total);
export const useSelectLogsLoading = () =>
  useSelector((state) => state.logs.loading);
export const useSelectLogsError = () =>
  useSelector((state) => state.logs.error);

export const useSelectLogCreating = () =>
  useSelector((state) => state.logs.creating);
export const useSelectLogCreateError = () =>
  useSelector((state) => state.logs.createError);

const logsReducer = logsSlice.reducer;
export default logsReducer;
