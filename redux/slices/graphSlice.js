import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chartData: [],
  graphSettings: {
    xAxis: { field: "", ticks: [], tickSize: 12 },
    yAxis: { category: "", title: "Value", unit: "RM", fields: [] },
    series: { category: "", fields: [] },
    general: {
      allowDecimal: true,
      monotype: "default",
      dateRange: "week",
      publishStatus: "unpublished",
    },
    meta: {
      graphName: "",
      graphDescription: "",
      selectedSource: "Client",
      selectedClientGroup: "",
    },
    activeTab: "date",
    targetX: "",
    targetY: "",
    targetSeries: "",
  },
  generateLoading: false,
  generateError: "",
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
    },
    generateGraphDataError(state, { payload }) {
      state.generateError = payload;
      state.generateLoading = false;
    },
    updateGraphSettings(state, { payload }) {
      state.graphSettings = { ...state.graphSettings, ...payload };
    },
  },
});

export const { generateGraphData, generateGraphDataSuccess, generateGraphDataError, updateGraphSettings } =
  graphSlice.actions;

// Selectors
export const useSelectGraphData = () => useSelector((state) => state.graph.chartData);
export const useSelectGraphSettings = () => useSelector((state) => state.graph.graphSettings);
export const useSelectGenerateLoading = () => useSelector((state) => state.graph.generateLoading);
export const useSelectGenerateError = () => useSelector((state) => state.graph.generateError);

const graphReducer = graphSlice.reducer;

export default graphReducer;
