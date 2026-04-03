import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  unreadMessages: [],
  unreadMessagesGroup: [],
  doc: null,
  quote: null,
  loading: false,
  sendChatNotificationLoading: false,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages(state, action) {
      state.messages = action.payload;
    },
    setUnreadMessages(state, action) {
      state.unreadMessages = action.payload;
    },
    setUnreadMessagesGroup(state, action) {
      state.unreadMessagesGroup = action.payload;
    },
    setDoc(state, action) {
      state.doc = action.payload;
    },
    setQuote(state, action) {
      state.quote = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },

    sendChatNotification(state) {
      state.sendChatNotificationLoading = true;
    },
    sendChatNotificationSuccess(state) {
      state.sendChatNotificationLoading = false;
    },

    // saga trigger
    fetchMessages() {},
  },
});

export const {
  setMessages,
  setUnreadMessages,
  setUnreadMessagesGroup,
  setDoc,
  setQuote,
  setLoading,
  fetchMessages,
  sendChatNotification,
  sendChatNotificationSuccess,
} = messageSlice.actions;

const messageReducer = messageSlice.reducer;
export default messageReducer;
