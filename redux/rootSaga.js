// sagas/index.js
import { all } from 'redux-saga/effects';
import authSaga from './sagas/authSaga';
import clientGroupSaga from './sagas/clientGroupSaga';
import companySaga from './sagas/companySaga';
import clientSaga from './sagas/clientSaga';
import formSaga from './sagas/formSaga';
import { tableSaga } from './sagas/tableSaga';
import { graphSaga } from './sagas/graphSaga';
import { invitationSaga } from './sagas/invitationSaga';
import { roleSaga } from './sagas/roleSaga';
import { roleAuthSaga } from './sagas/roleAuthSaga';
import { logsSaga } from './sagas/logSaga';
import { appointmentSaga } from './sagas/appointmentSaga';
import formTemplateSaga from './sagas/formTemplateSaga';
import formSubmissionSaga from './sagas/formSubmissionSaga';
import formApprovalSaga from './sagas/formApprovalSaga';
import { kpiSaga } from './sagas/kpiSaga';
import { dashboardSaga } from './sagas/dashboardSaga';
// Root saga
function* rootSaga() {
  yield all([
    authSaga(),
    clientGroupSaga(),
    companySaga(),
    clientSaga(),
    // formSaga(),
    tableSaga(),
    graphSaga(),
    invitationSaga(),
    roleSaga(),
    roleAuthSaga(),
    logsSaga(),
    appointmentSaga(),
    formTemplateSaga(),
    formSubmissionSaga(),
    formApprovalSaga(),
    kpiSaga(),
    dashboardSaga()
  ]);
}

export default rootSaga;