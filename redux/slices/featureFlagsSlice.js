import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  flags: {},
};

const featureFlagsSlice = createSlice({
  name: "featureFlags",
  initialState,
  reducers: {
    setFeatureFlags: (state, action) => {
      state.flags = action.payload;
    },
  },
});

export const { setFeatureFlags } = featureFlagsSlice.actions;
const featureFlagsReducer = featureFlagsSlice.reducer;
export default featureFlagsReducer;