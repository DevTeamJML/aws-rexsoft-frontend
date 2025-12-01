/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  devIndicators: false,
  experimental: {
    optimizeCss: false, // disables lightningcss
  },
  env: {
    CURR_SELECTED_GROUP_ID: "curr_selected_group_id",
    CURR_COMPANY_ID: "company_id",
    CURR_USER_ID: "user_id",
    API_URL: isProd ? "https://https://cqyambqcrdzvmje8gm.zumaxdigital.com:8081/v1" : "http://localhost:8080/v1",
    FIREBASE_API_KEY: "AIzaSyDGMS-R8G80ewcoPbePBcAUojKkV52-94Q",
    FIREBASE_AUTH_DOMAIN: "zumax-crm-v2.firebaseapp.com",
    FIREBASE_PROJECT_ID: "zumax-crm-v2",
    FIREBASE_STORAGE_BUCKET: "zumax-crm-v2.firebasestorage.app",
    FIREBASE_MESSAGING_SENDER_ID: "999968721936",
    FIREBASE_APP_ID: "1:999968721936:web:28cbfd81f2e73e83144e95",
    FIREBASE_DATABASE_URL:
      "https://zumax-crm-v2-default-rtdb.asia-southeast1.firebasedatabase.app",
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
