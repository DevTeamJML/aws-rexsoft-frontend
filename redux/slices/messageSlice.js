import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  unreadMessages: [],
  unreadMessagesGroup: [],
  selectedMessage: null,
  doc: null,
  quote: null,
  loading: false,
  sendChatNotificationLoading : false,
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
    setSelectedMessage(state, action) {
      state.selectedMessage = action.payload;
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
    sendChatNotificationSuccess(state, { payload }) {
      state.sendChatNotificationLoading = false;
    },

    // trigger saga
    fetchMessages(state, action) {},
  },
});

export const {
  setMessages,
  setUnreadMessages,
  setUnreadMessagesGroup,
  setSelectedMessage,
  setDoc,
  setQuote,
  setLoading,
  fetchMessages,
  sendChatNotification,
  sendChatNotificationSuccess
} = messageSlice.actions;

const messageReducer = messageSlice.reducer
export default messageReducer;