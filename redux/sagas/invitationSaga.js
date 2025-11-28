import { call, delay, put, takeLatest } from "redux-saga/effects";

import { ApiRoute } from "@/enums/api-route";
import { API } from "@/service/api";
import {
  getInvitationById,
  getInvitationByIdSuccess,
  getInvitationByIdError,
  acceptInvitation,
  acceptInvitationError,
  acceptInvitationSuccess,
  registerAndAcceptInvitation,
  registerAndAcceptInvitationError,
  registerAndAcceptInvitationSuccess,
  resendInvitation,
  resendInvitationError,
  resendInvitationSuccess,
  inviteUserToCompany,
  inviteUserToCompanySuccess,
  getAllInvitationAndUser,
  getAllInvitationAndUserSuccess,
  getAllInvitationAndUserError,
  removeInvitationSuccess,
  removeInvitationError,
  removeInvitationAndUser,
} from "../slices/invitationSlice";
import { hideToast, showToast } from "../slices/toastSlice";

function* handleRetrieveInvitation({ payload }) {
  try {
    const { data } = yield call(
      API.get,
      ApiRoute.invitation.getInvitationById,
      {
        params: { invitation_id: payload },
      }
    );

    console.log(data);
    yield delay(2000);
    yield put(getInvitationByIdSuccess(data));
  } catch (error) {
    const errorMessage = error.response.data.description;
    yield put(getInvitationByIdError(errorMessage));
    console.error(error.response.data);
  }
}

function* handleAcceptInvitation({ payload }) {
  try {
    yield call(API.post, ApiRoute.invitation.accept, payload);
    yield delay(2000);
    yield put(acceptInvitationSuccess());
    window.location.replace("/");
  } catch (error) {
    const errorMessage = error.response.data.description;
    yield put(acceptInvitationError(errorMessage));

    console.error(error.response.data);
  }
}

function* handleRegisterAndAcceptInvitation({ payload }) {
  try {
    yield call(
      API.post,
      ApiRoute.invitation.signUpAndAcceptInvitation,
      payload
    );
    yield delay(2000);

    yield delay(2000);
    yield put(registerAndAcceptInvitationSuccess());
    if (payload.invitation_id) {
      window.location.replace("/");
    }
  } catch (error) {
    const errorMessage = error.response.data.description;
    yield put(registerAndAcceptInvitationError(errorMessage));

    console.error(error.response.data);
  }
}

function* handleResendInvitation({ payload }) {
  try {
    // yield put(toggleDialogBox({ general: { data: null, isOpen: false } }));
    const { invitation_id = null } = payload;
    const query = `${ApiRoute.invitation.resend}?invitation_id=${invitation_id}`;
    yield call(API.post, query);

    yield delay(1000);
    yield put(resendInvitationSuccess());
  } catch (error) {
    const errorMessage = error.response.data.description;
    yield put(resendInvitationError(errorMessage));

    console.error(error.response.data);
  }
}

function* inviteUserToCompanySaga({ payload }) {
  try {
    const { router, body } = payload;
    yield put(
      showToast({
        message: "Sending invitation, please wait..",
        status: "success",
        loader: true,
      })
    );
    const response = yield call(
      API.post,
      ApiRoute.invitation.inviteUserToCompany,
      body
    );
    if (response && response.status === 201) {
      yield put(
        showToast({
          message: response.data.message,
          status: "success",
          loader: true,
        })
      );
    } else {
      yield put(
        showToast({
          message: response.data.error,
          status: "error",
        })
      );
    }
    yield delay(3000);
    yield put(hideToast());
    router.push("/control-panel/user-list");
    yield put(inviteUserToCompanySuccess());
  } catch (error) {
    console.log(error);
  }
}

function* getAllInvitationAndUserSaga({ payload }) {
  try {
    const { data } = yield call(
      API.get,
      ApiRoute.invitation.getAllInvitationAndUser,
      {
        params: { company_id: payload },
      }
    );
    yield delay(2000);
    yield put(getAllInvitationAndUserSuccess(data));
  } catch (error) {
    const errorMessage = error.response.data.description;
    yield put(getAllInvitationAndUserError(errorMessage));
    console.error(error.response.data);
  }
}

function* removeInvitationSaga({ payload }) {
  try {
    const response = yield call(
      API.post,
      ApiRoute.invitation.removeInvitationAndUser,
      payload
    );
    yield put(
      showToast({
        message: "Processing, please wait...",
        status: "success",
        loader: true,
      })
    );
    yield delay(2000);
    yield put(
      showToast({
        message: "Remove user/invitation from company successfully !",
        status: "success",
      })
    );
    yield put(removeInvitationSuccess(payload.id));
    yield put(hideToast());
  } catch (error) {
    const errorMessage = error.response.data.description;
    yield put(removeInvitationError(errorMessage));
    console.error(error.response.data);
  }
}

export function* invitationSaga() {
  yield takeLatest(getInvitationById.type, handleRetrieveInvitation);
  yield takeLatest(acceptInvitation.type, handleAcceptInvitation);
  yield takeLatest(
    registerAndAcceptInvitation.type,
    handleRegisterAndAcceptInvitation
  );
  yield takeLatest(resendInvitation.type, handleResendInvitation);
  yield takeLatest(inviteUserToCompany.type, inviteUserToCompanySaga);
  yield takeLatest(resendInvitation.type, handleResendInvitation);
  yield takeLatest(getAllInvitationAndUser.type, getAllInvitationAndUserSaga);
  yield takeLatest(removeInvitationAndUser.type, removeInvitationSaga);
}
