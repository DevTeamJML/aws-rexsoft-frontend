import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  leader: [],
  getAllLeaderLoading: false,
  assignLeaderLoading: false,
  updateLeaderLoading: false,
  deleteLeaderLoading: false,
};
const leaderSlice = createSlice({
  name: "leader",
  initialState,

  reducers: {
    getAllLeader(state) {
      state.getAllLeaderLoading = true;
    },

    getAllLeaderSuccess(state, { payload }) {
      state.leader = payload;
      state.getAllLeaderLoading = false;
    },

    assignLeader(state) {
      state.assignLeaderLoading = true;
    },

    assignLeaderSuccess(state, { payload }) {
      state.leader.unshift(payload);

      state.assignLeaderLoading = false;
    },

    updateLeader(state) {
      state.updateLeaderLoading = true;
    },

    updateLeaderSuccess(state, { payload }) {
      state.leader = state.leader.map((item) =>
        item.leader_id === payload.leader_id ? payload : item,
      );

      state.updateLeaderLoading = false;
    },

    deleteLeader(state) {
      state.deleteLeaderLoading = true;
    },

    deleteLeaderSuccess(state, { payload }) {
      state.leader = state.leader.filter(
        (item) => item.leader_id !== payload.leader_id,
      );

      state.deleteLeaderLoading = false;
    },
  },
});

// Export the reducer functions as actions
export const {
  getAllLeader,
  getAllLeaderSuccess,
  assignLeader,
  assignLeaderSuccess,
  updateLeader,
  updateLeaderSuccess,
  deleteLeader,
  deleteLeaderSuccess,
} = leaderSlice.actions;

export const useSelectAllLeader = () =>
  useSelector((state) => state.leader.leader);

const leaderReducer = leaderSlice.reducer;

export default leaderReducer;
