import { useState } from "react";
import {
  Box, Typography, Button, LinearProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Alert, CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SavingsIcon from "@mui/icons-material/Savings";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { depositGoal } from "../../services/api";

const GOAL_COLORS = [
  { main: "#34d399", light: "#eef2ff", dark: "#059669" },
  { main: "#10b981", light: "#ecfdf5", dark: "#059669" },
  { main: "#f59e0b", light: "#fffbeb", dark: "#d97706" },
  { main: "#ef4444", light: "#fef2f2", dark: "#dc2626" },
  { main: "#8b5cf6", light: "#f5f3ff", dark: "#7c3aed" },
  { main: "#06b6d4", light: "#ecfeff", dark: "#0891b2" },
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

function getMilestone(percent) {
  if (percent >= 100) return {
    emoji: "🏆", label: "Hoàn thành!", chipColor: "#10b981", chipBg: "#ecfdf5",
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    message: "Tuyệt vời! Bạn đã đạt được mục tiêu! Thật đáng tự hào!",
  };
  if (percent >= 75) return {
    emoji: "🔥", label: "Gần về đích!", chipColor: "#f59e0b", chipBg: "#fffbeb",
    icon: <WhatshotIcon sx={{ fontSize: 14 }} />,
    message: "Sắp đến rồi! Đừng bỏ cuộc, bạn đang làm rất tốt!",
  };
  if (percent >= 50) return {
    emoji: "🚀", label: "Nửa chặng đường", chipColor: "#34d399", chipBg: "#eef2ff",
    icon: <RocketLaunchIcon sx={{ fontSize: 14 }} />,
    message: "Bạn đã vượt qua nửa chặng! Tiếp tục duy trì nhé!",
  };
  if (percent >= 25) return {
    emoji: "💪", label: "Đang tiến lên", chipColor: "#06b6d4", chipBg: "#ecfeff",
    icon: <FavoriteIcon sx={{ fontSize: 14 }} />,
    message: "Khởi đầu tốt! Mỗi đồng tiết kiệm đều có giá trị!",
  };
  return {
    emoji: "🌱", label: "Mới bắt đầu", chipColor: "#8b5cf6", chipBg: "#f5f3ff",
    icon: <SavingsIcon sx={{ fontSize: 14 }} />,
    message: "Hãy kiên trì! Hành trình ngàn dặm bắt đầu từ một bước!",
  };
}

// ─── Deposit Dialog ────────────────────────────────────────────────────────────
function DepositDialog({ open, goal, colors, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuick = (val) => setAmount(String(val));

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ (lớn hơn 0).");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await depositGoal(goal.id, num);
      onSuccess(res.data);
      setAmount("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Đã xảy ra lỗi khi nạp tiền.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    onClose();
  };

  const remaining = Math.max(Number(goal?.target_amount) - Number(goal?.current_amount), 0);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Dialog Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.main}, ${colors.dark})`,
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <SavingsOutlinedIcon sx={{ color: "#fff", fontSize: 28 }} />
        <Box>
          <DialogTitle
            sx={{ p: 0, color: "#fff", fontSize: 16, fontWeight: 700 }}
          >
            Nạp tiền tiết kiệm
          </DialogTitle>
          <Typography fontSize={12} sx={{ color: "rgba(255,255,255,0.8)" }}>
            {goal?.name}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        {/* Progress summary */}
        <Box
          p={2}
          mb={2.5}
          borderRadius={3}
          sx={{ bgcolor: colors.light }}
        >
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography fontSize={13} color="text.secondary">Đã tiết kiệm</Typography>
            <Typography fontSize={13} fontWeight={700} color={colors.main}>
              {Number(goal?.current_amount || 0).toLocaleString()} đ
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} color="text.secondary">Còn thiếu</Typography>
            <Typography fontSize={13} fontWeight={700} color="#ef4444">
              {remaining.toLocaleString()} đ
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}

        {/* Amount input */}
        <TextField
          fullWidth
          label="Số tiền nạp (VNĐ)"
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError(""); }}
          InputProps={{
            endAdornment: <InputAdornment position="end">đ</InputAdornment>,
            sx: { borderRadius: 3 },
          }}
          sx={{ mb: 2 }}
          autoFocus
        />

        {/* Quick amounts */}
        <Typography fontSize={12} color="text.secondary" mb={1}>
          Nạp nhanh:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {QUICK_AMOUNTS.map((q) => (
            <Chip
              key={q}
              label={`${(q / 1000).toLocaleString()}k`}
              onClick={() => handleQuick(q)}
              sx={{
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 12,
                bgcolor: amount === String(q) ? colors.main : colors.light,
                color: amount === String(q) ? "#fff" : colors.main,
                border: `1px solid ${colors.main}30`,
                "&:hover": { bgcolor: colors.main, color: "#fff" },
              }}
            />
          ))}
          {remaining > 0 && (
            <Chip
              label="Nạp đủ số còn thiếu"
              onClick={() => handleQuick(remaining)}
              sx={{
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 12,
                bgcolor: amount === String(remaining) ? "#ef4444" : "#fef2f2",
                color: amount === String(remaining) ? "#fff" : "#ef4444",
                border: "1px solid #ef444430",
                "&:hover": { bgcolor: "#ef4444", color: "#fff" },
              }}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{ borderRadius: 3, color: "text.secondary", textTransform: "none" }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !amount}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddCircleIcon />}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            background: `linear-gradient(135deg, ${colors.main}, ${colors.dark})`,
            boxShadow: `0 4px 16px ${colors.main}40`,
            "&:hover": { opacity: 0.92 },
          }}
        >
          {loading ? "Đang nạp..." : "Xác nhận nạp tiền"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main SavingGoal Component ─────────────────────────────────────────────────
function SavingGoal({ goals: initialGoals = [] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [depositTarget, setDepositTarget] = useState(null); // { goal, colors }

  // Sync with parent when prop changes
  useState(() => { setGoals(initialGoals); }, [initialGoals]);

  const handleDepositSuccess = (updatedGoal) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box>
          <Typography fontWeight={700} fontSize={16}>Mục tiêu tiết kiệm</Typography>
          <Typography fontSize={12} color="text.secondary">Theo dõi tiến độ của bạn</Typography>
        </Box>
        <Button
          component={Link}
          to="/finance/goal/new"
          size="small"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 5,
            px: 2,
            fontSize: 12,
            fontWeight: 600,
            bgcolor: "#eef2ff",
            color: "#34d399",
            "&:hover": { bgcolor: "#e0e7ff" },
            textTransform: "none",
          }}
        >
          Thêm mục tiêu
        </Button>
      </Box>

      {goals.length === 0 ? (
        <Box
          p={5}
          textAlign="center"
          bgcolor="#fff"
          borderRadius={5}
          sx={{ border: "2px dashed #e5e7eb" }}
        >
          <SavingsIcon sx={{ fontSize: 52, color: "#d1d5db", mb: 1.5 }} />
          <Typography fontWeight={700} fontSize={16} color="text.secondary">
            Bạn chưa có mục tiêu tiết kiệm nào
          </Typography>
          <Typography fontSize={13} color="text.secondary" mt={0.5} mb={3}>
            Tạo ngay để theo dõi tiến độ tiết kiệm!
          </Typography>
          <Button
            component={Link}
            to="/finance/goal/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 5, bgcolor: "#34d399", fontWeight: 600,
              textTransform: "none", "&:hover": { bgcolor: "#059669" },
            }}
          >
            Tạo mục tiêu đầu tiên
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            gap: 2.5,
          }}
        >
          <AnimatePresence>
            {goals.map((goal, idx) => {
              const target = Number(goal.target_amount);
              const current = Number(goal.current_amount);
              const percent = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
              const colors = GOAL_COLORS[idx % GOAL_COLORS.length];
              const milestone = getMilestone(percent);
              const isComplete = percent >= 100;

              let daysLeft = null;
              let isLate = false;
              if (goal.deadline) {
                const diff = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                daysLeft = diff;
                if (diff < 0) isLate = true;
              }

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <Box
                    p={3}
                    bgcolor="#fff"
                    borderRadius={5}
                    sx={{
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                      borderTop: `4px solid ${colors.main}`,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Background blob */}
                    <Box sx={{
                      position: "absolute", top: -30, right: -30,
                      width: 100, height: 100, borderRadius: "50%",
                      bgcolor: colors.main, opacity: 0.05, pointerEvents: "none",
                    }} />

                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography fontWeight={700} fontSize={15}>{goal.name}</Typography>
                        <Chip
                          size="small"
                          icon={milestone.icon}
                          label={milestone.label}
                          sx={{
                            mt: 0.5, height: 22, fontSize: 11, fontWeight: 600,
                            color: milestone.chipColor, bgcolor: milestone.chipBg,
                            "& .MuiChip-icon": { color: milestone.chipColor, ml: 0.8 },
                            "& .MuiChip-label": { px: 1 },
                          }}
                        />
                      </Box>
                      <Typography fontSize={26} lineHeight={1}>{milestone.emoji}</Typography>
                    </Box>

                    {/* Amount */}
                    <Box>
                      <Typography fontSize={22} fontWeight={800} color={colors.main} lineHeight={1}>
                        {current.toLocaleString()}
                        <Typography component="span" fontSize={12} color="text.secondary" fontWeight={400} ml={0.5}>đ</Typography>
                      </Typography>
                      <Typography fontSize={12} color="text.secondary" mt={0.3}>
                        Mục tiêu: <strong>{target.toLocaleString()} đ</strong>
                      </Typography>
                    </Box>

                    {/* Progress */}
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.8}>
                        <Typography fontSize={12} color="text.secondary" fontWeight={600}>Tiến độ</Typography>
                        <Typography fontSize={13} fontWeight={800} color={colors.main}>{percent}%</Typography>
                      </Box>
                      <Box position="relative">
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                            height: 12, borderRadius: 6, bgcolor: colors.light,
                            "& .MuiLinearProgress-bar": {
                              background: `linear-gradient(90deg, ${colors.main}, ${colors.dark})`,
                              borderRadius: 6,
                            },
                          }}
                        />
                        {[25, 50, 75].map((tick) => (
                          <Box key={tick} sx={{
                            position: "absolute", top: "50%", left: `${tick}%`,
                            transform: "translate(-50%, -50%)",
                            width: 2, height: 16, bgcolor: "#fff", opacity: 0.8,
                            borderRadius: 1, pointerEvents: "none",
                          }} />
                        ))}
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={0.5} px={0.2}>
                        {["0", "25%", "50%", "75%", "100%"].map((m) => (
                          <Typography key={m} fontSize={9} color="text.secondary" sx={{ opacity: 0.6 }}>{m}</Typography>
                        ))}
                      </Box>
                    </Box>

                    {/* Motivational quote */}
                    <Box px={1.5} py={1} borderRadius={3} bgcolor={milestone.chipBg}>
                      <Typography fontSize={12} color={milestone.chipColor} fontWeight={500} fontStyle="italic">
                        "{milestone.message}"
                      </Typography>
                    </Box>

                    {/* Bottom: Deadline + Deposit button */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                      {daysLeft !== null ? (
                        <Chip
                          size="small"
                          label={
                            isLate && !isComplete ? `⏰ Trễ ${Math.abs(daysLeft)} ngày`
                              : daysLeft === 0 ? "⚡ Hôm nay hết hạn!"
                                : `📅 Còn ${daysLeft} ngày`
                          }
                          sx={{
                            fontSize: 11, fontWeight: 600, height: 24,
                            bgcolor: isLate && !isComplete ? "#fef2f2" : "#f9fafb",
                            color: isLate && !isComplete ? "#ef4444" : "text.secondary",
                          }}
                        />
                      ) : <Box />}

                      {!isComplete && (
                        <Button
                          size="small"
                          startIcon={<AddCircleIcon sx={{ fontSize: 16 }} />}
                          onClick={() => setDepositTarget({ goal, colors })}
                          sx={{
                            borderRadius: 4,
                            px: 1.5,
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: "none",
                            background: `linear-gradient(135deg, ${colors.main}, ${colors.dark})`,
                            color: "#fff",
                            boxShadow: `0 3px 10px ${colors.main}40`,
                            "&:hover": { opacity: 0.9 },
                          }}
                        >
                          Nạp tiền
                        </Button>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      )}

      {/* Deposit Dialog */}
      {depositTarget && (
        <DepositDialog
          open={!!depositTarget}
          goal={depositTarget.goal}
          colors={depositTarget.colors}
          onClose={() => setDepositTarget(null)}
          onSuccess={handleDepositSuccess}
        />
      )}
    </Box>
  );
}

export default SavingGoal;
