import { combineReducers } from "@reduxjs/toolkit";
import toastReducer from "./slices/toastSlice";
import authReducer from "./slices/authSlice";
import confirmModalReducer from "./slices/confirmModalSlice";
import clientGroupReducer from "./slices/clientGroupSlice";
import newCompanyModalReducer from "./slices/companyModalSlice";
import companyReducer from "./slices/companySlice";
import clientReducer from "./slices/clientSlice";
import formReducer from "./slices/formSlice";
import tableReducer from "./slices/tableSlice";
import graphReducer from "./slices/graphSlice";
import invitationReducer from "./slices/invitationSlice";
import roleReducer from "./slices/roleSlice";
import roleAuthReducer from "./slices/roleAuthSlice";
import logsReducer from "./slices/logSlice";
import appointmentReducer from "./slices/appointmentSlice";
import formTemplateReducer from "./slices/formTemplateSlice";
import formSubmissionReducer from "./slices/formSubmissionSlice";
import formApprovalReducer from "./slices/formApprovalSlice";
import kpiReducer from "./slices/kpiSlice";

const rootReducer = combineReducers({
    toast : toastReducer,
    user : authReducer,
    confirmModal : confirmModalReducer,
    client : clientReducer,
    clientGroup : clientGroupReducer,
    company : companyReducer,
    newCompanyModal : newCompanyModalReducer,
    // form: formReducer,
    table : tableReducer,
    graph: graphReducer,
    invitation : invitationReducer,
    role : roleReducer,
    roleAuth : roleAuthReducer,
    logs : logsReducer,
    appointments : appointmentReducer,
    formTemplate : formTemplateReducer,
    formSubmission : formSubmissionReducer,
    formApproval : formApprovalReducer,
    kpi : kpiReducer
  });
  
  export default rootReducer;