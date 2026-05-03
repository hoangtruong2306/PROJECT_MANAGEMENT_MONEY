import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, Paper, Grid,
  InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return setError("Mật khẩu xác nhận không khớp.");
    }
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password });
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

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
          Bắt Đầu Hành Trình
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.85, maxWidth: "80%" }}>
          Tạo tài khoản ngay hôm nay để kiểm soát hoàn toàn nền tảng tài chính của bạn.
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
          <Typography component="h1" variant="h4" fontWeight="bold" color="#1e293b" gutterBottom>
            Tạo Tài Khoản
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Điền thông tin bên dưới để tham gia với chúng tôi
          </Typography>

          <Box component="form" onSubmit={submit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Họ và tên"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ bgcolor: "#fff", borderRadius: 1 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Địa chỉ Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ bgcolor: "#fff", borderRadius: 1 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ bgcolor: "#fff", borderRadius: 1 }}
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
              margin="normal"
              required
              fullWidth
              label="Xác nhận mật khẩu"
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              sx={{ bgcolor: "#fff", borderRadius: 1 }}
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

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 4, mb: 3, py: 1.5,
                bgcolor: "#7c3aed",
                "&:hover": { bgcolor: "#6d28d9" },
                fontSize: "1rem", fontWeight: "bold", textTransform: "none",
                borderRadius: 2
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng ký ngay"}
            </Button>

            <Box display="flex" justifyContent="center" mb={3}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setLoading(true); setError("");
                  try {
                    const { user: googleUser } = await loginWithGoogle(credentialResponse.credential);
                    navigate(googleUser?.role === "admin" ? "/admin" : "/");
                  } catch (err) {
                    setError("Đăng ký / Đăng nhập Google thất bại");
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError("Đăng ký / Đăng nhập Google thất bại");
                }}
              />
            </Box>

            <Box textAlign="center">
              <Link to="/login" style={{ color: "#475569", textDecoration: "none", fontSize: "0.95rem" }}>
                Đã có tài khoản? <span style={{ color: "#7c3aed", fontWeight: 600 }}>Quay lại đăng nhập</span>
              </Link>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
