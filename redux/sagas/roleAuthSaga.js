import { call, put, takeLatest } from "redux-saga/effects";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";

import {
  getUserRoles,
  getUserRolesSuccess,
  getUserRolesError,
} from "../slices/roleAuthSlice";

function* getUserRolesSaga({ payload }) {
  try {
    const { company_id, user_id } = payload;

    const response = yield call(API.get, ApiRoute.role.getUserRoles, {
      params: { company_id, user_id },
    });

    const roles = response.data.roles || [];
    const permissions = response.data.effectivePermissions || [];
    
    yield put(
      getUserRolesSuccess({
        roles,
        permissions,
      })
    );
  } catch (err) {
    console.error("Get user roles error:", err);
    yield put(getUserRolesError(err.message || "Failed to get user roles"));
  }
}

export function* roleAuthSaga() {
  yield takeLatest(getUserRoles.type, getUserRolesSaga);
}
