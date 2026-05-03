import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "@mui/material/styles";
import { GoogleOAuthProvider } from "@react-oauth/google";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import "./index.css";
import "./App.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "vui_long_nhap_chuoi_client_id_cua_bạn_vao_day";

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
);
