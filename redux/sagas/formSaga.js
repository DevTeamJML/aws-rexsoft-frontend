// import { call, delay, put, takeLatest } from "redux-saga/effects";
// import {
//   createFormTemplate,
//   createFormTemplateSuccess,
//   retrieveAllFormTemplate,
//   retrieveAllFormTemplateSuccess,
//   retrieveFormTemplate,
//   retrieveFormTemplateSuccess,
//   updateFormTemplate,
//   updateFormTemplateSuccess,
//   deleteFormTemplate,
//   deleteFormTemplateSuccess,
//   createFormSubmission,
//   createFormSubmissionSuccess,
//   retrieveAllFormSubmission,
//   retrieveAllFormSubmissionSuccess,
//   retrieveFormSubmission,
//   retrieveFormSubmissionSuccess,
//   updateFormSubmission,
//   updateFormSubmissionSuccess,
//   deleteFormSubmission,
//   deleteFormSubmissionSuccess,
// } from "../slices/formSlice";
// import { API } from "@/service/api";
// import { ApiRoute } from "@/enums/api-route";
// import { ref, remove, set } from "firebase/database";
// import { db } from "@/config/firebaseConfig";

// function* handleCreateFormTemplateSaga({ payload }) {
//   const { body, router } = payload;
//   const formQuestionIdList = body.question.map((item) => {
//     return item.form_question_id;
//   });
//   try {
//     yield call(API.post, ApiRoute.form.create, body);
//     yield put(createFormTemplateSuccess());
//     yield call(
//       set,
//       ref(db, `FormTemplateSorting/${body.form_template_id}`),
//       formQuestionIdList
//     );
//     router.push("/form/form-template");
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// function* handleCreateFormSubmission({ payload }) {
//   const { body, router } = payload;
//   try {
//     yield call(API.post, ApiRoute.formSubmission.create, body);
//     yield put(createFormSubmissionSuccess());
//     router.push("/form/form-submission");
//   } catch (error) {
//     console.log("error", error);
//     throw error;
//   }
// }

// function* handleRetrieveAllFormTemplateSaga({ payload }) {
//   try {
//     const query = `${ApiRoute.form.getAll}?company_id=${payload}`;
//     const { data } = yield call(API.get, query);

//     yield put(retrieveAllFormTemplateSuccess(data));
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// function* handleRetrieveAllFormSubmissionSaga({ payload }) {
//   try {
//     const query = `${ApiRoute.formSubmission.getAll}?user_id=${payload}`;
//     const { data } = yield call(API.get, query);
//     yield put(retrieveAllFormSubmissionSuccess(data));
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// function* handleRetrieveFormTemplate({ payload }) {
//   try {
//     const query = `${ApiRoute.form.get}?form_template_id=${payload}`;
//     const { data } = yield call(API.get, query);

//     yield put(retrieveFormTemplateSuccess(data));
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// function* handleRetrieveFormSubmission({ payload }) {
//   try {
//     const query = `${ApiRoute.formSubmission.get}?form_submission_id=${payload}`;

//     const { data } = yield call(API.get, query);

//     yield put(retrieveFormSubmissionSuccess(data));
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// function* handleUpdateFormTemplate({ payload }) {
//   const { body, router } = payload;
//   const formQuestionIdList = body.question.map((item) => {
//     return item.form_question_id;
//   });
//   try {
//     const query = `${ApiRoute.form.update}`;
//     const { data } = yield call(API.patch, query, body);
//     yield put(updateFormTemplateSuccess(data));
//     yield call(
//       set,
//       ref(db, `FormTemplateSorting/${body.form_template_id}`),
//       formQuestionIdList
//     );
//     router.push("/form/form-template");
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// function* handleUpdateFormSubmission({ payload }) {
//   const { body, router } = payload;

//   const formQuestionIdList = body.form_answer.map((item) => {
//     return item.form_question_id;
//   });

//   try {
//     const query = `${ApiRoute.formSubmission.update}`;
//     const { data } = yield call(API.patch, query, body);
//     yield put(updateFormSubmissionSuccess(data));

//     yield call(
//       set,
//       ref(db, `FormTemplateSorting/${body.form_template_id}`),
//       formQuestionIdList
//     );
//     router.push("/form/form-submission");
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// function* handleDeleteFormTemplate({ payload }) {
//   try {
//     const query = `${ApiRoute.form.delete}?form_template_id=${payload}`;
//     const { data } = yield call(API.delete, query);
//     yield put(deleteFormTemplateSuccess(data));
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// function* handleDeleteFormSubmission({ payload }) {
//   try {
//     const query = `${ApiRoute.formSubmission.delete}?form_submission_id=${payload}`;
//     const { data } = yield call(API.delete, query);
//     yield put(deleteFormSubmissionSuccess(data));
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// function* formSaga() {
//   yield takeLatest(createFormTemplate.type, handleCreateFormTemplateSaga);
//   yield takeLatest(
//     retrieveAllFormTemplate.type,
//     handleRetrieveAllFormTemplateSaga
//   );
//   yield takeLatest(
//     retrieveAllFormSubmission.type,
//     handleRetrieveAllFormSubmissionSaga
//   );
//   yield takeLatest(retrieveFormTemplate.type, handleRetrieveFormTemplate);
//   yield takeLatest(retrieveFormSubmission.type, handleRetrieveFormSubmission);
//   yield takeLatest(updateFormTemplate.type, handleUpdateFormTemplate);
//   yield takeLatest(deleteFormTemplate.type, handleDeleteFormTemplate);
//   yield takeLatest(createFormSubmission.type, handleCreateFormSubmission);
//   yield takeLatest(updateFormSubmission.type, handleUpdateFormSubmission);
//   yield takeLatest(deleteFormSubmission.type, handleDeleteFormSubmission);
// }

// export default formSaga;
