// sagas/index.js
import { all } from 'redux-saga/effects';
import authSaga from './sagas/authSaga';
import clientGroupSaga from './sagas/clientGroupSaga';
import companySaga from './sagas/companySaga';
import clientSaga from './sagas/clientSaga';
import formSaga from './sagas/formSaga';
import { tableSaga } from './sagas/tableSaga';
// Root saga
function* rootSaga() {
  yield all([
    authSaga(),
    clientGroupSaga(),
    companySaga(),
    clientSaga(),
    formSaga(),
    tableSaga()
  ]);
}

export default rootSaga;