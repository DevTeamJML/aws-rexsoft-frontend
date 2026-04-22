import { eventChannel } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import { ref, onValue } from "firebase/database";
import { db } from "@/config/firebaseConfig";
import { setFeatureFlags } from "../slices/featureFlagsSlice";

function createFeatureChannel() {
  return eventChannel((emit) => {
    const featureRef = ref(db, "featureFlags");

  
    const unsubscribe = onValue(featureRef, (snapshot) => {
      emit(snapshot.val() || {});
    });

    return () => unsubscribe();
  });
}

function* watchFeatureFlags() {
  const channel = yield call(createFeatureChannel);

  while (true) {
    const data = yield take(channel);
    yield put(setFeatureFlags(data));
  }
}

export default watchFeatureFlags;