/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  devIndicators: false,
  trailingSlash: true,
  reactStrictMode: false,
  output: "export",
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // (optional) prevents build fail due to lint errors
  },
  experimental: {
    optimizeCss: false, // disables lightningcss
  },
  env: {
    CURR_SELECTED_GROUP_ID: "curr_selected_group_id",
    CURR_COMPANY_ID: "company_id",
    CURR_USER_ID: "user_id",
    // API_URL: "https://clone.crm-server-eh2y9u82.com/v1",
    // API_URL: "http://localhost:8080/v1",
    API_URL: "https://dupli.crm-server-eh2y9u82.com/v1",
    
    // API_URL: "https://crm-server-eh2y9u82.com/v1",
    
    FIREBASE_API_KEY: "AIzaSyBE4XGHiR8N5mQlVAFRDYwuIgYrpI3DJLQ",
    FIREBASE_AUTH_DOMAIN: "rexsoft-crm.firebaseapp.com",
    FIREBASE_PROJECT_ID: "rexsoft-crm",
    FIREBASE_STORAGE_BUCKET: "rexsoft-crm.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "382834266814",
    FIREBASE_APP_ID: "1:382834266814:web:32a93d2c7c4121cd4f04ef",
    FIREBASE_DATABASE_URL:
      "https://rexsoft-crm-default-rtdb.asia-southeast1.firebasedatabase.app",

    // FIREBASE_API_KEY: "AIzaSyARgnICQB_9v8l2xIMhgzvo8NP-lSRbZvs",
    // FIREBASE_AUTH_DOMAIN: "temp-crm-b8272.firebaseapp.com",
    // FIREBASE_PROJECT_ID: "temp-crm-b8272",
    // FIREBASE_STORAGE_BUCKET: "temp-crm-b8272.appspot.com",
    // FIREBASE_MESSAGING_SENDER_ID: "339307891102",
    // FIREBASE_APP_ID: "1:339307891102:web:f72ea1b03625408c00ee8f",
    // FIREBASE_DATABASE_URL:
    //   "https://temp-crm-b8272-default-rtdb.asia-southeast1.firebasedatabase.app",
  },
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/system",
      "@mui/utils",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "@mui/x-tree-view",
    ],
  },
};

export default nextConfig;
