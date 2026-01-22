import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  // Data
  upcomingAppointments: [],
  activityLogs: [],

  // Loading
  getDashboardLoading: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    getDashboard(state) {
      state.getDashboardLoading = true;
    },

    getDashboardSuccess(state, { payload }) {
      state.upcomingAppointments = payload.upcomingAppointments || [];
      state.activityLogs = payload.activityLogs || [];
      state.getDashboardLoading = false;
    },

    getDashboardFailure(state) {
      state.getDashboardLoading = false;
    },
  },
});

export const {
  getDashboard,
  getDashboardSuccess,
  getDashboardFailure,
} = dashboardSlice.actions;

export const useSelectDashboardUpcomingAppointments = () =>
  useSelector((state) => state.dashboard.upcomingAppointments);

export const useSelectDashboardActivityLogs = () =>
  useSelector((state) => state.dashboard.activityLogs);

export const useSelectGetDashboardLoading = () =>
  useSelector((state) => state.dashboard.getDashboardLoading);

const dashboardReducer = dashboardSlice.reducer;
export default dashboardReducer;
