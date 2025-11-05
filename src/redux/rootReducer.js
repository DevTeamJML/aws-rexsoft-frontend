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

const rootReducer = combineReducers({
    toast : toastReducer,
    user : authReducer,
    confirmModal : confirmModalReducer,
    client : clientReducer,
    clientGroup : clientGroupReducer,
    company : companyReducer,
    newCompanyModal : newCompanyModalReducer,
    form: formReducer,
    table : tableReducer,
  });
  
  export default rootReducer;