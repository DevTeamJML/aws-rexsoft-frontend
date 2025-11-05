import axios from "axios";

export const API = axios.create({
  baseURL: process.env.API_URL,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});



// setInitialHeaders();

// export const setHeaders = (headers, axiosInstance = API) => {
//   const commonHeaders = { ...axiosInstance.defaults.headers.common };
//   Object.keys(headers).forEach((key) => (commonHeaders[key] = headers[key]));
//   axiosInstance.defaults.headers.common = commonHeaders;
// };

// export const deleteHeaders = (headerKeys, axiosInstance = API) => {
//   const commonHeaders = { ...axiosInstance.defaults.headers.common };
//   headerKeys.forEach((key) => commonHeaders[key] && delete commonHeaders[key]);
//   axiosInstance.defaults.headers.common = commonHeaders;
// };

// /* Reading localstorage data and adding common headers on axios initialization */
// export function setInitialHeaders() {
//   const access_token = getFromLocalStorage(ACCESS_TOKEN);
//   const refreshToken = getFromLocalStorage(REFRESH_TOKEN);
//   API.defaults.headers.common[Headers.ContentType] = "application/json";
//   const local_company_id = getFromLocalStorage(CURR_COMPANY_ID);

//   if (local_company_id) {
//     API.defaults.headers.common[Headers.company_id] = local_company_id;
//   }

//   if (access_token) {
//     API.defaults.headers.common[
//       Headers.Authorization
//     ] = `Bearer ${access_token}`;
//   }
//   API.defaults.headers.common[Headers.refresh_token] = refreshToken;
// }

// API.interceptors.request.use(
//   (config) => {
//     const access_token = getFromLocalStorage(ACCESS_TOKEN);
//     const local_company_id = getFromLocalStorage(CURR_COMPANY_ID);
//     const header_company_id = config.headers.company_id;

//     if (!header_company_id && local_company_id) {
//       config.headers.company_id = local_company_id;
//     }
//     config.headers.Authorization = `Bearer ${access_token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// API.interceptors.response.use(
//   (config) => {
//     return config;
//   },
//   async (error) => {
//     // let skipMessageDisplay = false;
//     const errorCode = error.response?.data?.code;
//     const originalRequest = error.config;

//     if (errorCode === "ACCESS_TOKEN_EXPIRED" && !originalRequest._retry) {
//       const refreshToken = getFromLocalStorage(REFRESH_TOKEN);
//       const company_id = getFromLocalStorage(CURR_COMPANY_ID);
//       originalRequest._retry = true;
//       console.info("Access expired, Retrying...");
//       return API.post(ApiRoute.auth.refresh, {
//         refreshToken,
//         company_id,
//       }).then((res) => {
//         if (res.status === 200 || res.status === 201) {
//           addToLocalStorage(ACCESS_TOKEN, res.data.tokens.access.token);
//           API.defaults.headers.common[
//             "Authorization"
//           ] = `Bearer ${res.data.tokens.access.token}`;
//           return API(originalRequest);
//         }
//       });

//       // ! Problem here... If refresh token expired... How
//     } else {
//       return Promise.reject(error);
//     }
//   }
// );
