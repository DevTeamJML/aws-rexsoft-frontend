// redux/sagas/tableSaga.js
import { call, put, takeEvery, select } from 'redux-saga/effects';
import { setSortConfig } from '../slices/tableSlice';

// Saga for handling sort requests
function* handleSortSaga(action) {
  try {
    const { columnId, order, tableId, sortApi } = action.payload;
    
    // Update local state
    yield put(setSortConfig({ columnId, order }));
    
    // If API provided, call backend for sorted data
    if (sortApi) {
      const response = yield call(sortApi, { columnId, order, tableId });

    }
    
  } catch (error) {
    console.error('Sort failed:', error);
  }
}

// Saga for handling column resize
function* handleColumnResizeSaga(action) {
  try {
    const { tableId, columnId, width } = action.payload;
  
    
  } catch (error) {
    console.error('Column resize failed:', error);
  }
}

export function* tableSaga() {
  yield takeEvery('TABLE/SORT_REQUEST', handleSortSaga);
  yield takeEvery('TABLE/COLUMN_RESIZE', handleColumnResizeSaga);
}