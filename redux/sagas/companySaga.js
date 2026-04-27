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
import { addToSessionStorage } from "@/utils/localStorage";
import { getAllClientGroups } from "../slices/clientGroupSlice";
import { defaultPermissions } from "@/constants/permissions";
import { createRole } from "../slices/roleSlice";
import { flattenPermissions } from "@/utils/format";

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
    addToSessionStorage(process.env.CURR_COMPANY_ID, company_id);
    // addToSessionStorage(CURR_COMPANY_ID, company_id);
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

    const rolePayload = {
      company_id : payload.company_id,
      name : "Default",
      color : "#CCCCCC",
      is_system: true,
      description : "Default role",
      permissions:  flattenPermissions(defaultPermissions)  
    }

    yield put(createRole({...rolePayload}));

    // {
    //   graph: { view_graph: false, manage_graph: false, publish_graph: false },
    //   logs: { view_all: false },
    //   client: {
    //     manage_client: false,
    //     export_client: false,
    //     delete_client: false,
    //     manage_handler: false,
    //   },
    //   client_group: {
    //     manage_client_group: false,
    //   },
    //   kpi: { view_kpi: false, manage_kpi: false, delete_kpi: false },
    //   form: {
    //     view_form: false,
    //     manage_form: false,
    //     delete_form: false,
    //     approval: false,
    //   },
    //   appointment: { view_all_appointment: false, manage_appointment: false },
    //   control_panel: { manage_roles: false, company_profile: false },
    // }
    yield put(toggleNewCompanyModal(false));
    addToSessionStorage(process.env.CURR_COMPANY_ID, payload.company_id);
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
