import { call, delay, put, takeLatest } from "redux-saga/effects";
import {
  createCompany,
  getAllCompanies,
  getAllCompaniesSuccess,
  switchCompany,
  switchCompanySuccess,
} from "../slices/companySlice";
import { ApiRoute } from "@/enums/api-route";
import { API } from "@/service/api";
import { hideToast, showToast } from "../slices/toastSlice";
import { toggleNewCompanyModal } from "../slices/companyModalSlice";
import { yellow } from "@mui/material/colors";
import { addToLocalStorage } from "@/utils/localStorage";
import { getAllClientGroups } from "../slices/clientGroupSlice";

function* switchCompanySaga({ payload }) {
  try {
    yield put(
      showToast({
        message: "Changing Company. Please wait.",
        status: "success",
        loader: true,
      })
    );
    const { company_id } = payload;
    addToLocalStorage(process.env.CURR_COMPANY_ID, company_id);
    // addToLocalStorage(CURR_COMPANY_ID, company_id);
    // yield put(switchUserCompany(company_id));
    /**
     * * Purposely stop for 2 seconds here
     */
    yield delay(2000);

    yield put(switchCompanySuccess(payload));
    // window.location.replace("/dashboard");
    window.location.reload();
    yield put(hideToast());
  } catch (error) {
    console.log(error);
  }
}

function* getAllCompaniesSaga({ payload }) {
  try {
    const response = yield call(API.get, ApiRoute.company.getAllCompanies, {
      params: payload,
    });
    const allCompaniesData = response.data.companies;
    yield put(getAllCompaniesSuccess(allCompaniesData));
  } catch (error) {
    console.log(error);
  }
}

function* createCompanySaga({ payload }) {
  const { user_id, ...otherData } = payload;
  try {
    const response = yield call(
      API.post,
      ApiRoute.company.createCompany,
      payload
    );
    yield put(
      showToast({
        message: "Create Company Successfully !",
        status: "success",
      })
    );
    yield put(toggleNewCompanyModal(false));
    addToLocalStorage(process.env.CURR_COMPANY_ID, payload.company_id);
    yield put(switchCompany(payload));
    yield delay(2000);
    yield put(hideToast());
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

// Watcher saga
function* companySaga() {
  yield takeLatest(switchCompany.type, switchCompanySaga);
  yield takeLatest(getAllCompanies.type, getAllCompaniesSaga);
  yield takeLatest(createCompany.type, createCompanySaga);
}

export default companySaga;
