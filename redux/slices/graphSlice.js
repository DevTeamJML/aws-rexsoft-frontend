import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  currGraph: null,
  publishedGraphs: [],
  graphs: [],
  chartData: [],
  graphSettings: {
    xAxis: { id: "", label: "", field_type: "", ticks: [] },
    yAxis: { id: "", label: "", field_type: "", title: "Value" },
    series: { id: "", label: "", field_type: "" },
    general: {
      monotype: "line",
      publishStatus: "unpublished",
    },
    meta: {
      graphName: "",
      graphDescription: "",
      selectedSource: "Client",
      selectedClientGroup: "",
    },
    dateFilter: {
      dateColumnId: "",
      range: "all",
    },
    sort: {
      by: "x",
      order: "asc",
    },
    viewableMembers: [],
  },
  generateLoading: false,
  generateError: "",
  saveGraphLoading: false,
  saveGraphError: "",
  getGraphsBySourceLoading: false,
  getGraphsBySourceError: "",
  deleteGraphLoading: false,
  deleteGraphError: "",
  getGraphByIdLoading: false,
  getGraphByIdError: "",
  getPublishedGraphByIdLoading: false,
  getPublishedGraphByIdError: "",
  getPublishedGraphLoading : false,
  getPublishedGraphError : ""
};

const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: {
    generateGraphData(state) {
      state.generateLoading = true;
      state.generateError = "";
    },
    generateGraphDataSuccess(state, { payload }) {
      state.chartData = payload;
      state.generateLoading = false;
    },
    generateGraphDataError(state, { payload }) {
      state.generateError = payload;
      state.generateLoading = false;
    },
    saveGraph(state) {
      state.saveGraphLoading = true;
      state.saveGraphError = "";
    },
    saveGraphSuccess(state, { payload }) {
      state.saveGraphLoading = false;
    },
    saveGraphError(state, { payload }) {
      state.saveGraphError = payload;
      state.saveGraphLoading = false;
    },

    deleteGraph(state) {
      state.deleteGraphLoading = true;
      state.deleteGraphError = "";
    },
    deleteGraphSuccess(state, { payload }) {
      state.graphs = state.graphs.filter((g) => g.graph_id !== payload.graph_id);
      state.deleteGraphLoading = false;
    },
    deleteGraphError(state, { payload }) {
      state.deleteGraphError = payload;
      state.deleteGraphLoading = false;
    },

    getGraphsBySource(state) {
      state.getGraphsBySourceLoading = true;
      state.getGraphsBySourceError = "";
    },
    getGraphsBySourceSuccess(state, { payload }) {
      state.graphs = payload;
      state.getGraphsBySourceLoading = false;
    },
    getGraphsBySourceError(state, { payload }) {
      state.getGraphsBySourceError = payload;
      state.getGraphsBySourceLoading = false;
    },

    getGraphById(state) {
      state.getGraphByIdLoading = true;
      state.getGraphByIdError = "";
    },
    getGraphByIdSuccess(state, { payload }) {
      state.currGraph = payload;
      state.getGraphByIdLoading = false;
    },
    getGraphByIdError(state, { payload }) {
      state.getGraphByIdError = payload;
      state.getGraphByIdLoading = false;
    },

    getPublishedGraph(state) {
      state.getPublishedGraphLoading = true;
      state.getPublishedGraphError = "";
    },
    getPublishedGraphSuccess(state, { payload }) {
      const existingIds = new Set(state.publishedGraphs.map((g) => g.graph_id));

      const newGraphs = payload.filter((g) => !existingIds.has(g.graph_id));

      state.publishedGraphs = [...state.publishedGraphs, ...newGraphs];

      state.getPublishedGraphLoading = false;
    },

    getPublishedGraphError(state, { payload }) {
      state.getPublishedGraphError = payload;
      state.getPublishedGraphLoading = false;
    },

    getPublishedGraphById(state) {
      state.getPublishedGraphByIdLoading = true;
      state.getPublishedGraphByIdError = "";
    },
    getPublishedGraphByIdSuccess(state, { payload }) {
      const idx = state.publishedGraphs.findIndex(
        (g) => g.graph_id === payload.graph_id
      );

      if (idx !== -1) {
        state.publishedGraphs[idx] = payload;
      } else {
        state.publishedGraphs.push(payload);
      }

      state.getPublishedGraphByIdLoading = false;
    },

    getPublishedGraphByIdError(state, { payload }) {
      state.getPublishedGraphByIdError = payload;
      state.getPublishedGraphByIdLoading = false;
    },

    updateGraphSettings(state, { payload }) {
      state.graphSettings = { ...state.graphSettings, ...payload };
    },
  },
});

export const {
  saveGraph,
  saveGraphError,
  saveGraphSuccess,
  generateGraphData,
  generateGraphDataSuccess,
  generateGraphDataError,
  deleteGraph,
  deleteGraphError,
  deleteGraphSuccess,
  getGraphsBySource,
  getGraphsBySourceError,
  getGraphsBySourceSuccess,
  updateGraphSettings,
  getGraphById,
  getGraphByIdError,
  getGraphByIdSuccess,
  getPublishedGraph,
  getPublishedGraphError,
  getPublishedGraphSuccess,
  getPublishedGraphById,
  getPublishedGraphByIdError,
  getPublishedGraphByIdSuccess,
} = graphSlice.actions;

// Selectors
export const useSelectGraphData = () =>
  useSelector((state) => state.graph.chartData);
export const useSelectGraphs = () => useSelector((state) => state.graph.graphs);
export const useSelectCurrGraph = () =>
  useSelector((state) => state.graph.currGraph);
export const useSelectPublishedGraphs = () =>
  useSelector((state) => state.graph.publishedGraphs);

export const useSelectGraphSettings = () =>
  useSelector((state) => state.graph.graphSettings);
export const useSelectGenerateLoading = () =>
  useSelector((state) => state.graph.generateLoading);
export const useSelectGenerateError = () =>
  useSelector((state) => state.graph.generateError);

const graphReducer = graphSlice.reducer;

export default graphReducer;
