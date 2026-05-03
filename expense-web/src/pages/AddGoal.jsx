import { useState } from "react";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { createGoal } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function AddGoal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    deadline: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.target_amount || !formData.deadline) {
      setError("Vui lòng nhập tên mục tiêu, số tiền và hạn chót!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createGoal({
        user_id: user.id,
        name: formData.name,
        target_amount: Number(formData.target_amount),
        current_amount: Number(formData.current_amount) || 0,
        deadline: formData.deadline,
      });

      navigate("/finance");
    } catch (err) {
      setError(err.response?.data?.error || "Đã xảy ra lỗi khi tạo mục tiêu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Button
        component={Link}
        to="/finance"
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Trở về Tài chính
      </Button>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          bgcolor: "#fff",
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={3}>
          Tạo mục tiêu tiết kiệm mới
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <TextField
          fullWidth
          label="Tên mục tiêu (VD: Mua xe máy)"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Số tiền cần đạt (VNĐ)"
          name="target_amount"
          type="number"
          value={formData.target_amount}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Số tiền hiện có (VNĐ) - Tùy chọn"
          name="current_amount"
          type="number"
          value={formData.current_amount}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Hạn chót"
          name="deadline"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.deadline}
          onChange={handleChange}
          margin="normal"
          required
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 4,
            py: 1.5,
            bgcolor: "#34d399",
            "&:hover": { bgcolor: "#059669" },
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {loading ? "Đang xử lý..." : "Tạo Mục Tiêu"}
        </Button>
      </Box>
    </Box>
  );
}

export default AddGoal;
