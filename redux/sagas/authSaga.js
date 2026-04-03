import { takeLatest, put, call, delay } from "redux-saga/effects";
import { hideToast, showToast } from "../slices/toastSlice";

import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  refreshSignIn,
  refreshSignInError,
  refreshSignInSuccess,
  signIn,
  signInError,
  signInSuccess,
  logOutError,
  logOutSuccess,
  logOut,
  resetPassword,
  resetPasswordSuccess,
} from "../slices/authSlice";
import { auth, db } from "@/config/firebaseConfig";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";
import {
  getAllCompanies,
  getAllCompaniesSuccess,
  getAllCompanyUsersSuccess,
  switchCompanySuccess,
} from "../slices/companySlice";
import {
  addToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
} from "@/utils/localStorage";
import {
  getAllClientGroups,
  getAllClientGroupsSuccess,
  setCurrClientGroupSuccess,
} from "../slices/clientGroupSlice";
import {
  setSelectedClientGroupIdSuccess,
  setSelectedClientGroupSuccess,
} from "../slices/clientSlice";
import { getUserRoles } from "../slices/roleAuthSlice";
import { getAllFormTemplatesSuccess } from "../slices/formTemplateSlice";
import { get, ref } from "firebase/database";

function* fetchFirebaseUsers(uids) {
  try {
    const snapshot = yield call(get, ref(db, "users"));

    if (!snapshot.exists()) return {};

    const firebaseData = snapshot.val();

    // Convert into map for fast lookup
    const firebaseMap = {};

    Object.keys(firebaseData).forEach((uid) => {
      firebaseMap[uid] = firebaseData[uid];
    });

    return firebaseMap;
  } catch (err) {
    console.error("Firebase fetch error:", err);
    return {};
  }
}

function* loadUserData(user, setAuthLoading) {
  if (setAuthLoading) setAuthLoading(true);
  const storedCompanyId = getFromLocalStorage(process.env.CURR_COMPANY_ID);
  const storedSelectedClientGroupId = getFromLocalStorage(
    process.env.CURR_SELECTED_GROUP_ID,
  );

  const { data } = yield call(API.get, ApiRoute.user.getUserDetailsById, {
    params: { user_id: user?.uid, company_id: storedCompanyId },
  });
  const { userDetails, companies } = data;

  const userData = { ...user, ...userDetails };

  // Company
  const selectedCompanyId =
    storedCompanyId || (companies?.length > 0 ? companies[0].company_id : null);

  let selectedCompany =
    companies?.find((c) => c.company_id === selectedCompanyId) || null;

  if (!selectedCompany && companies?.length > 0) {
    selectedCompany = companies[0];
    addToLocalStorage(process.env.CURR_COMPANY_ID, selectedCompany.company_id);
  }

  if (selectedCompanyId) {
    // Form Response
    const formResponse = yield call(
      API.get,
      ApiRoute.formTemplate.getAllFormTemplates,
      {
        params: { company_id: selectedCompanyId },
      },
    );

    const formList = formResponse.data;
    yield put(getAllFormTemplatesSuccess(formList));

    // Group Response
    const groupResponse = yield call(
      API.get,
      ApiRoute.clientGroup.getAllClientGroups,
      {
        params: { company_id: selectedCompanyId },
      },
    );
    const groupList = groupResponse.data;

    const selectedGroupId =
      storedSelectedClientGroupId ||
      (groupList?.length > 0 ? groupList[0].client_group_id : null);

    let selectedGroup =
      groupList?.find((c) => c.client_group_id === selectedGroupId) || null;

    if (!selectedGroup && groupList?.length > 0) {
      selectedGroup = groupList[0];
      addToLocalStorage(
        process.env.CURR_SELECTED_GROUP_ID,
        selectedGroup.client_group_id,
      );
    }
    yield put(getAllClientGroupsSuccess(groupList));
    if (selectedGroup) {
      const groupId = selectedGroup.client_group_id;
      yield put(setSelectedClientGroupIdSuccess(groupId));
      yield put(setSelectedClientGroupSuccess(selectedGroup));
    }

    // Handler Response
    const handlerResponse = yield call(
      API.get,
      ApiRoute.companyUser.getAllCompanyUsers,
      {
        params: { company_id: selectedCompanyId },
      },
    );

    const apiUsers = handlerResponse.data || [];

    const firebaseUsersMap = yield call(fetchFirebaseUsers);

    const mergedUsers = apiUsers.map((user) => {
      const firebaseUser = firebaseUsersMap[user.user_id];

      return {
        ...user,
        ...(firebaseUser || {}),
      };
    });

    yield put(
      getAllCompanyUsersSuccess({
        list: mergedUsers,
        currentUserId: user?.uid,
      }),
    );
    yield put(
      getUserRoles({ company_id: selectedCompanyId, user_id: user?.uid }),
    );
  }

  // yield put(signInSuccess(userData));
  yield put(getAllCompaniesSuccess(companies));

  if (selectedCompany) {
    yield put(switchCompanySuccess(selectedCompany));
  }
  if (setAuthLoading) setAuthLoading(false);
}

function* refreshSignInSaga({ payload }) {
  const { user, setAuthLoading } = payload;
  try {
    yield call(loadUserData, user, setAuthLoading);
    yield put(refreshSignInSuccess(user));
  } catch (error) {
    setAuthLoading(true);
    console.log(error);
    yield put(refreshSignInError(error.message));
  }
}

function* signInSaga({ payload }) {
  const { email = "", password = "", router } = payload;
  try {
    yield put(
      showToast({
        message: "Signing in..",
        status: "success",
        loader: true,
      }),
    );
    const { user = {} } = yield call(
      signInWithEmailAndPassword,
      auth,
      email,
      password,
    );
    yield call(loadUserData, user);
    yield put(signInSuccess(user));
    yield put(
      showToast({
        message: "Sign In successfully.",
        status: "success",
        loader: true,
      }),
    );
    yield delay(1500);
    router.push("/client/client-list");
    yield put(hideToast());
  } catch (error) {
    yield put(signInError(error.message));
    yield put(
      showToast({
        message: error.message,
        status: "error",
        loader: true,
      }),
    );
    yield delay(3000);
    yield put(hideToast());
  }
}

function* resetPasswordSaga({ payload }) {
  const { email, setShowResetModal } = payload;
  try {
    //  yield put(
    //     showToast({
    //         message: "Sending mail..",
    //         status: "success",
    //         loader: true,
    //     })
    // );
    yield call(sendPasswordResetEmail, auth, email);
    // yield delay(3000);
    yield put(resetPasswordSuccess(payload));
    // setShowResetModal(false);
    // yield put(
    //     showToast({
    //         message: "Sent successfully ! Please check your mail and junk folder for the reset link !",
    //         status: "success"
    //     })
    // );
    // yield delay(5000);
    // yield put(hideToast());
  } catch (error) {
    console.log(error);
    // yield put(resetPasswordError(error.message));
    // yield put(
    //     showToast({
    //         message: error.message,
    //         status: "error",
    //         loader: true,
    //     })
    // );
    // yield delay(3000);
    // yield put(hideToast());
  }
}

function* logOutSaga({ payload }) {
  try {
    const { router } = payload;
    yield call(signOut, auth);
    yield put(logOutSuccess(null));
    removeFromLocalStorage(process.env.CURR_COMPANY_ID);
    yield put(switchCompanySuccess(null));
    router.push("/");
    // yield put(
    //     showToast({
    //         message: "Sign Out successfully.",
    //         status: "success",
    //         loader: true,
    //     })
    // );
    // yield delay(1500);
    // yield put(hideToast());
  } catch (error) {
    console.log(error);
    yield put(logOutError(error.message));
    // yield put(
    //     showToast({
    //         message: error.message,
    //         status: "error",
    //         loader: true,
    //     })
    // );
    // yield delay(3000);
    // yield put(hideToast());
  }
}

function* registerSaga() {
  // updateProfile(user, {
  //     displayName: "Cheng Wang",
  //   })
  //     .then(() => {
  //       // Profile updated successfully
  //       console.log("Display name updated!");
  //     })
  //     .catch((error) => {
  //       // An error occurred
  //       console.error("Error updating display name:", error);
  //     });
}

// Watcher saga
function* authSaga() {
  yield takeLatest(logOut.type, logOutSaga);
  yield takeLatest(signIn.type, signInSaga);
  yield takeLatest(refreshSignIn.type, refreshSignInSaga);
  yield takeLatest(resetPassword.type, resetPasswordSaga);
}

export default authSaga;
