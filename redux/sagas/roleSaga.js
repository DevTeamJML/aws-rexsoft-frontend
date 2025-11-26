// src/redux/sagas/roleSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import { API } from "@/service/api";
import {
  getAllRoles,
  getAllRolesSuccess,
  getAllRolesError,
  getRole,
  getRoleSuccess,
  getRoleError,
  createRole,
  createRoleSuccess,
  createRoleError,
  updateRole,
  updateRoleSuccess,
  updateRoleError,
  deleteRoleSuccess,
  deleteRole,
  deleteRoleError,
} from "../slices/roleSlice";
import { ApiRoute } from "@/enums/api-route";

function buildParams(payload) {
  // payload may be { company_id } or other params
  return { params: payload || {} };
}

/**
 * GET list of roles
 * payload: { company_id: "..." }
 */
function* getAllRolesSaga({ payload }) {
  try {
    const res = yield call(
      API.get,
      ApiRoute.role.getAllRoles,
      buildParams(payload)
    );
    // depending on API client, res may be response.data; follow your API pattern:
    const data = res?.data ?? res;
    yield put(getAllRolesSuccess(data));
  } catch (error) {
    console.error("Error fetching roles:", error);
    yield put(getAllRolesError(error.message || "Failed to fetch roles"));
  }
}

/**
 * GET single role detail
 * payload: { role_id: "..." }
 * Note: backend supports query param or body; we'll call GET /get-role?role_id=...
 */
function* getRoleSaga({ payload }) {
  try {
    console.log(payload);
    const res = yield call(
      API.get,
      ApiRoute.role.getRole,
      buildParams(payload)
    );
    const data = res?.data ?? res;
    yield put(getRoleSuccess(data));
  } catch (error) {
    console.error("Error fetching role:", error);
    yield put(getRoleError(error.message || "Failed to fetch role"));
  }
}

/**
 * CREATE role
 * payload: { company_id, name, color, description, permissions, members }
 */
function* createRoleSaga({ payload }) {
  try {
    console.log(payload);
    const res = yield call(API.post, ApiRoute.role.createRole, payload);
    const data = res?.data ?? res;
    yield put(createRoleSuccess(data));
  } catch (error) {
    console.error("Error creating role:", error);
    yield put(createRoleError(error.message || "Failed to create role"));
  }
}

/**
 * UPDATE role (POST /update with role_id in body)
 * payload: { role_id, name?, color?, permissions?, members?, updated_by? }
 */
function* updateRoleSaga({ payload }) {
  try {
    const res = yield call(API.post, ApiRoute.role.updateRole, payload);
    const data = res?.data ?? res;
    yield put(updateRoleSuccess(data));
  } catch (error) {
    console.error("Error updating role:", error);
    yield put(updateRoleError(error.message || "Failed to update role"));
  }
}

function* handleDeleteRole({ payload }) {
  try {
    // API call
    const result = yield call(API.post, ApiRoute.role.deleteRole, payload);
    // success
    yield put(deleteRoleSuccess(payload));
  } catch (err) {
    const message =
      err?.response?.data?.message || err?.message || "Failed to delete role";
    yield put(deleteRoleError(message));
  }
}

export function* roleSaga() {
  yield takeLatest(getAllRoles.type, getAllRolesSaga);
  yield takeLatest(getRole.type, getRoleSaga);
  yield takeLatest(createRole.type, createRoleSaga);
  yield takeLatest(updateRole.type, updateRoleSaga);
  yield takeLatest(deleteRole.type, handleDeleteRole);
}
