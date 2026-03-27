import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChat: null,
  chatId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setPrivateChat: (state, action) => {
      const { currentUserId, user } = action.payload;

      const chatId =
        currentUserId > user.uid
          ? currentUserId + user.uid
          : user.uid + currentUserId;

      state.selectedChat = user;
      state.chatId = chatId;
    },

    setGroupChat: (state, action) => {
      const { group } = action.payload;

      state.selectedChat = group;
      state.chatId = group.userInfo;
    },

    clearChat: (state) => {
      state.selectedChat = null;
      state.chatId = null;
    },
  },
});

export const { setPrivateChat, setGroupChat, clearChat } = chatSlice.actions;

const chatReducer = chatSlice.reducer;

export default chatReducer;
