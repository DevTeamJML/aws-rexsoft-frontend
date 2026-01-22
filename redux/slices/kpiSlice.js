import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  kpis: [],
  currKpi: null,
  publishedKpis: [],
  kpiGroups: [],
  currKpiGroup: null,

  saveKpiLoading: false,
  saveKpiError: "",

  deleteKpiLoading: false,
  deleteKpiError: "",

  getKpisBySourceLoading: false,
  getKpisBySourceError: "",

  getKpiByIdLoading: false,
  getKpiByIdError: "",

  getPublishedKpiLoading: false,
  getPublishedKpiError: "",

  getPublishedKpiByIdLoading: false,
  getPublishedKpiByIdError: "",
};

const kpiSlice = createSlice({
  name: "kpi",
  initialState,
  reducers: {
    saveKpi(state) {
      state.saveKpiLoading = true;
      state.saveKpiError = "";
    },
    saveKpiSuccess(state) {
      state.saveKpiLoading = false;
    },
    saveKpiError(state, { payload }) {
      state.saveKpiError = payload;
      state.saveKpiLoading = false;
    },
    deleteKpi(state) {
      state.deleteKpiLoading = true;
      state.deleteKpiError = "";
    },
    deleteKpiSuccess(state, { payload }) {
      state.kpis = state.kpis.filter((k) => k.kpi_group_d !== payload.kpi_group_id);
      state.deleteKpiLoading = false;
    },
    deleteKpiError(state, { payload }) {
      state.deleteKpiError = payload;
      state.deleteKpiLoading = false;
    },
    getKpisBySource(state) {
      state.getKpisBySourceLoading = true;
      state.getKpisBySourceError = "";
    },
    getKpisBySourceSuccess(state, { payload }) {
      state.kpis = payload;
      state.getKpisBySourceLoading = false;
    },
    getKpisBySourceError(state, { payload }) {
      state.getKpisBySourceError = payload;
      state.getKpisBySourceLoading = false;
    },
    getKpiById(state) {
      state.getKpiByIdLoading = true;
      state.getKpiByIdError = "";
    },
    getKpiByIdSuccess(state, { payload }) {
      state.currKpi = payload;
      state.getKpiByIdLoading = false;
    },
    getKpiByIdError(state, { payload }) {
      state.getKpiByIdError = payload;
      state.getKpiByIdLoading = false;
    },
    getPublishedKpi(state) {
      state.getPublishedKpiLoading = true;
      state.getPublishedKpiError = "";
    },
    getPublishedKpiSuccess(state, { payload }) {
      
      state.publishedKpis = payload;
      state.getPublishedKpiLoading = false;
    },
    getPublishedKpiError(state, { payload }) {
      state.getPublishedKpiError = payload;
      state.getPublishedKpiLoading = false;
    },
    getPublishedKpiById(state) {
      state.getPublishedKpiByIdLoading = true;
      state.getPublishedKpiByIdError = "";
    },
    getPublishedKpiByIdSuccess(state, { payload }) {
      const idx = state.publishedKpis.findIndex(
        (k) => k.kpi_id === payload.kpi_id
      );

      if (idx !== -1) {
        state.publishedKpis[idx] = payload;
      } else {
        state.publishedKpis.push(payload);
      }

      state.getPublishedKpiByIdLoading = false;
    },
    getPublishedKpiByIdError(state, { payload }) {
      state.getPublishedKpiByIdError = payload;
      state.getPublishedKpiByIdLoading = false;
    },
    updateKpiSettings(state, { payload }) {
      state.kpiSettings = payload;
    },
  },
});

export const {
  saveKpi,
  saveKpiSuccess,
  saveKpiError,
  deleteKpi,
  deleteKpiSuccess,
  deleteKpiError,
  getKpisBySource,
  getKpisBySourceSuccess,
  getKpisBySourceError,
  getKpiById,
  getKpiByIdSuccess,
  getKpiByIdError,
  getPublishedKpi,
  getPublishedKpiSuccess,
  getPublishedKpiError,
  getPublishedKpiById,
  getPublishedKpiByIdSuccess,
  getPublishedKpiByIdError,
  updateKpiSettings,
} = kpiSlice.actions;

export const useSelectKpis = () => useSelector((state) => state.kpi.kpis);

export const useSelectCurrKpi = () => useSelector((state) => state.kpi.currKpi);

export const useSelectPublishedKpis = () =>
  useSelector((state) => state.kpi.publishedKpis);

export const useSelectKpiSettings = () =>
  useSelector((state) => state.kpi.kpiSettings);

export const useSelectSaveKpiLoading = () =>
  useSelector((state) => state.kpi.saveKpiLoading);

export const useSelectSaveKpiError = () =>
  useSelector((state) => state.kpi.saveKpiError);

const kpiReducer = kpiSlice.reducer;
export default kpiReducer;
