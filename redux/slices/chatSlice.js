import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChat: null,
  chatId: null,
  chats: {},
  unreadCount: [],
  conversationGroup: false,
  groupUsers: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setPrivateChat: (state, action) => {
      const { user, chatId } = action.payload;

      state.selectedChat = {
        chatId,
        isGroup: false,
        userInfo: user,
        groupInfo: null,
      };

      state.chatId = chatId;
    },

    setGroupChat: (state, action) => {
      const { group } = action.payload;

      state.selectedChat = {
        chatId: group.userInfo,
        isGroup: true,
        userInfo: null,
        groupInfo: group.groupInfo,
      };

      state.chatId = group.userInfo;
    },

    clearChat: (state) => {
      state.selectedChat = null;
      state.chatId = null;
    },

    setChats: (state, action) => {
      state.chats = action.payload;
    },

    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    setConversationGroup: (state, action) => {
      state.conversationGroup = action.payload;
    },
  },
});

export const {
  setPrivateChat,
  setGroupChat,
  clearChat,
  setChats,
  setUnreadCount,
  setConversationGroup,
} = chatSlice.actions;

export default chatSlice.reducer;
