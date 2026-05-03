import React, { useState } from "react";
import {
  Box, TextField, Button, Typography, Paper, Grid,
  CircularProgress, Alert
} from "@mui/material";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left Side - Branding (Hidden on small screens) */}
      <Grid
        item
        xs={false}
        sm={4}
        md={6}
        sx={{
          background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          p: 4,
          textAlign: "center"
        }}
      >
        <img
          src="/expense_app_logo.png"
          alt="App Logo"
          style={{ width: "120px", height: "120px", borderRadius: "50%", marginBottom: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
        />
        <Typography variant="h3" fontWeight="800" mb={2}>
          Khôi Phục Truy Cập
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.85, maxWidth: "80%" }}>
          Lấy lại quyền kiểm soát tài khoản của bạn thông qua quy trình bảo mật an toàn.
        </Typography>
      </Grid>

      {/* Right Side - Form */}
      <Grid
        item
        xs={12}
        sm={8}
        md={6}
        component={Paper}
        elevation={0}
        square
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8fafc"
        }}
      >
        <Box sx={{ my: 6, mx: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 400 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", mb: 2,
                boxShadow: "0 8px 16px rgba(124,58,237,0.3)"
              }}
            >
              <LockResetIcon fontSize="large" />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#1e293b">
              Quên mật khẩu?
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mt={1}>
              Nhập email của bạn và chúng tôi sẽ gửi đường link để khôi phục.
            </Typography>
          </Box>

          {success ? (
            <Box display="flex" flexDirection="column" gap={3}>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Đường link khôi phục đã được gửi! Vui lòng kiểm tra hộp thư của email: <strong>{email}</strong>
              </Alert>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 2, textTransform: "none", fontWeight: 700, py: 1.2,
                  borderColor: "#7c3aed", color: "#7c3aed",
                  "&:hover": { borderColor: "#6d28d9", bgcolor: "rgba(124,58,237,0.04)" }
                }}
              >
                Quay lại Đăng nhập
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={submit}>
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <TextField
                fullWidth
                label="Địa chỉ Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3, bgcolor: "#fff", borderRadius: 1 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: 2, py: 1.5, textTransform: "none", fontWeight: 700, fontSize: "1rem",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 8px 16px rgba(124,58,237,0.3)",
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Gửi link khôi phục"}
              </Button>

              <Box mt={4} textAlign="center">
                <Link to="/login" style={{ textDecoration: "none", color: "#475569", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ArrowBackIcon fontSize="small" /> <span style={{ color: "#7c3aed" }}>Quay lại đăng nhập</span>
                </Link>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
