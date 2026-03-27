import { eventChannel } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { ref, onValue } from "firebase/database";
import {
  setMessages,
  setUnreadMessages,
  setUnreadMessagesGroup,
  setLoading,
  sendChatNotification,
} from "../slices/messageSlice";
import { db } from "@/config/firebaseConfig";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";

function createMessageChannel(chatId) {
  return eventChannel((emit) => {
    const chatsRef = ref(db, `chats/${chatId}/messages`);

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      emit(snapshot.val());
    });

    return () => unsubscribe();
  });
}

function* fetchMessagesSaga(action) {
  const chatId = action.payload;

  yield put(setLoading(true));

  const channel = yield call(createMessageChannel, chatId);

  try {
    while (true) {
      const data = yield take(channel);

      if (!data) {
        yield put(setMessages([]));
        continue;
      }

      const messages = Object.values(data).sort(
        (a, b) => a.date - b.date
      );

      const unread = [];
      const readGroup = [];

      messages.forEach((msg) => {
        if (msg.text) {
          if (!msg.hasRead) unread.push(msg);
          else readGroup.push(msg);
        }
      });

      yield put(setMessages(messages));
      yield put(setUnreadMessages(unread));
      yield put(setUnreadMessagesGroup(readGroup));
      yield put(setLoading(false));
    }
  } finally {
    channel.close();
  }
}


function* sendChatNotificationSaga({ payload }) {

  const channel = yield call(API.post, ApiRoute.message.sendChatNotifcation, payload);

  try {
    while (true) {
      const data = yield take(channel);

      if (!data) {
        yield put(setMessages([]));
        continue;
      }

      const messages = Object.values(data).sort(
        (a, b) => a.date - b.date
      );

      const unread = [];
      const readGroup = [];

      messages.forEach((msg) => {
        if (msg.text) {
          if (!msg.hasRead) unread.push(msg);
          else readGroup.push(msg);
        }
      });

      yield put(setMessages(messages));
      yield put(setUnreadMessages(unread));
      yield put(setUnreadMessagesGroup(readGroup));
      yield put(setLoading(false));
    }
  } finally {
    channel.close();
  }
}

export function* messageSaga() {
  yield takeLatest("message/fetchMessages", fetchMessagesSaga);
  yield takeLatest(sendChatNotification, sendChatNotificationSaga);
}