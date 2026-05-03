import React from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";

// Splash screen hiển thị khi app đang khởi tạo (loading auth, config...)
export default function SplashScreen({ message = "Đang tải ứng dụng..." }) {
  const clearToken = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {}
    window.location.reload();
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        bgcolor: "#f5f7fb",
      }}
    >
      <CircularProgress size={64} />
      <Typography sx={{ mt: 2 }} variant="body1">
        {message}
      </Typography>

      {process.env.NODE_ENV !== "production" && (
        <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={clearToken}>
          Clear dev token
        </Button>
      )}
    </Box>
  );
}
