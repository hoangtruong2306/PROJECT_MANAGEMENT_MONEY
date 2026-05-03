import React, { useState } from "react";
import {
  Box, TextField, Button, Typography, Paper, Grid,
  CircularProgress, Alert, InputAdornment, IconButton
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/api";
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Link đặt lại mật khẩu không hợp lệ hoặc bị thiếu (không có token).");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await resetPassword({ token, password });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Grid container sx={{ minHeight: "100vh" }}>
        <Grid item xs={12} component={Paper} elevation={0} square sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#f5f7fb" }}>
          <Box sx={{ p: 4, borderRadius: 4, textAlign: "center", maxWidth: 420 }}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              Link khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.
            </Alert>
            <Button
              component={Link}
              to="/forgot-password"
              variant="contained"
              fullWidth
              sx={{ borderRadius: 2, py: 1.2, textTransform: "none", fontWeight: 700, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
            >
              Quay lại trang Quên mật khẩu
            </Button>
          </Box>
        </Grid>
      </Grid>
    );
  }

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
          Thiết Lập Lại
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.85, maxWidth: "80%" }}>
          Lưu trữ thông tin an toàn. Hãy tạo một mật khẩu mới thật mạnh mẽ.
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
              <VpnKeyIcon fontSize="large" />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#1e293b">
              Mật khẩu mới
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mt={1}>
              Vui lòng nhập mật khẩu mới của bạn và đảm bảo nó đủ mạnh.
            </Typography>
          </Box>

          {success ? (
            <Box display="flex" flexDirection="column" gap={3}>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Thay đổi mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
              </Alert>
              <Button
                onClick={() => navigate("/login")}
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 2, py: 1.5, textTransform: "none", fontWeight: 700, fontSize: "1rem",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 8px 16px rgba(124,58,237,0.3)",
                }}
              >
                Đi đến Đăng nhập
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={submit}>
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <TextField
                fullWidth
                label="Mật khẩu mới"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2, bgcolor: "#fff", borderRadius: 1 }}
                helperText="Tối thiểu 6 ký tự"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 3, bgcolor: "#fff", borderRadius: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : "Cập nhật mật khẩu"}
              </Button>

              <Box mt={4} textAlign="center">
                <Link to="/login" style={{ textDecoration: "none", color: "#475569", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ArrowBackIcon fontSize="small" /> Bỏ qua
                </Link>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
