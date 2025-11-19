// redux/slices/tableSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sortConfig: {
    columnId: "",
    order: "asc",
  },
  columnWidths: {},
  tableConfigs: {},
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setSortConfig: (state, action) => {
      state.sortConfig = action.payload;
    },
    updateColumnWidth: (state, action) => {
      const { tableId, columnId, width } = action.payload;
      if (!state.columnWidths[tableId]) {
        state.columnWidths[tableId] = {};
      }
      state.columnWidths[tableId][columnId] = width;
    },
    setTableConfig: (state, action) => {
      const { tableId, config } = action.payload;
      state.tableConfigs[tableId] = config;
    },
    resetTableState: (state) => {
      state.sortConfig = initialState.sortConfig;
    },
  },
});

export const {
  setSortConfig,
  updateColumnWidth,
  setTableConfig,
  resetTableState,
} = tableSlice.actions;

// Fixed selectors
export const useSelectSortConfig = (state) => state.table.sortConfig;
export const useSelectColumnWidths = (tableId) => (state) =>
  state.table.columnWidths[tableId];

export const useSelectTableConfig = (state) => state.table.tableConfigs;

export default tableSlice.reducer;
