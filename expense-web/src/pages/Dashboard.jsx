import { Grid, Box, Typography, Button, Paper, Chip, Skeleton, Alert } from "@mui/material";
import RecentTransactions from "../components/Dashboard/RecentTransactions";
import CategoryDonut from "../components/Analytics/CategoryDonut";
import ExpenseTrendChart from "../components/Analytics/ExpenseTrendChart";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserStats, getCategoryStats, getTrendStats } from "../services/api";
import { motion } from "framer-motion";
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const trendPercent = stats
    ? (stats.expense_last_month > 0
        ? ((stats.expense_this_month - stats.expense_last_month) / stats.expense_last_month * 100).toFixed(1)
        : 0)
    : 0;
  const trendUp = Number(trendPercent) >= 0;

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError("");
        const [s, cats, ts] = await Promise.all([
          getUserStats(user.id),
          getCategoryStats(user.id),
          getTrendStats(user.id)
        ]);
        setStats(s.data.data || s.data);
        setCategories(cats.data?.data || []);
        const trendRaw = ts.data?.data || ts.data || [];
        setTrends(Array.isArray(trendRaw) ? trendRaw : []);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* ─── Hero Section ─── */}
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-end" mb={4} gap={3}>
          <Box>
            <Typography color="text.secondary" fontSize={14} fontWeight={600} mb={1} letterSpacing={0.5}>
              TỔNG SỐ DƯ HIỆN TẠI
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              {loading ? (
                <Skeleton variant="text" width={260} height={64} sx={{ borderRadius: 2 }} />
              ) : (
                <Typography fontSize={{ xs: 40, md: 52 }} fontWeight={800} letterSpacing="-1.5px" color="#0F172A" lineHeight={1}>
                  {Number(stats?.balance ?? 0).toLocaleString('vi-VN')}
                  <span style={{ fontSize: 24, fontWeight: 600, color: '#94A3B8', marginLeft: 8 }}>₫</span>
                </Typography>
              )}
              {!loading && (
                <Chip
                  icon={<ArrowUpwardRoundedIcon sx={{ fontSize: 16, transform: trendUp ? 'none' : 'rotate(180deg)' }} />}
                  label={`${trendUp ? '+' : ''}${trendPercent}%`}
                  size="small"
                  sx={{ bgcolor: trendUp ? '#FEF2F2' : '#ECFDF5', color: trendUp ? '#DC2626' : '#059669', fontWeight: 700, borderRadius: 2, px: 0.5 }}
                />
              )}
            </Box>
          </Box>

          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              startIcon={<AccountBalanceWalletOutlinedIcon />}
              onClick={() => navigate('/finance')}
              sx={{ borderRadius: 3, px: 2.5, py: 1, borderColor: '#CBD5E1', color: '#334155', fontWeight: 600, textTransform: 'none', bgcolor: '#fff' }}
            >
              Dòng tiền
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => navigate('/finance/transaction/new')}
              sx={{ borderRadius: 3, px: 2.5, py: 1, bgcolor: '#059669', boxShadow: 'none', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#047857', boxShadow: 'none' } }}
            >
              Giao dịch
            </Button>
          </Box>
        </Box>

        {/* ─── Modular Bento Grid ─── */}
        <Grid container spacing={3}>

          {/* Cột chính */}
          <Grid item xs={12} lg={8} display="flex" flexDirection="column" gap={3}>
            <Paper elevation={0} sx={{ borderRadius: 5, border: "1px solid #E2E8F0", overflow: 'hidden' }}>
              {loading
                ? <Skeleton variant="rectangular" height={280} />
                : <ExpenseTrendChart trends={trends} />
              }
            </Paper>

            <Box>
              <Typography fontWeight={700} fontSize={18} mb={1.5} color="#0F172A">
                Hoạt động gần đây
              </Typography>
              <Paper elevation={0} sx={{ borderRadius: 5, border: "1px solid #E2E8F0", overflow: 'hidden' }}>
                <RecentTransactions limit={5} />
              </Paper>
            </Box>
          </Grid>

          {/* Cột phụ */}
          <Grid item xs={12} lg={4} display="flex" flexDirection="column" gap={3}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: "1px solid #E2E8F0" }}>
              <Typography fontSize={18} fontWeight={700} color="#0F172A" mb={0.5}>
                Cơ cấu chi tiêu
              </Typography>
              <Typography fontSize={14} color="#64748B" mb={3}>
                Danh mục tháng nổi bật
              </Typography>
              <Box height={300} display="flex" justifyContent="center">
                {loading ? (
                  <Skeleton variant="circular" width={200} height={200} sx={{ mt: 2 }} />
                ) : categories.length > 0 ? (
                  <CategoryDonut categories={categories} />
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography color="text.secondary" fontSize={14}>Chưa có giao dịch</Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Mini Stats */}
            <Box display="flex" flexDirection="column" gap={2}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: "1px solid #E2E8F0", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="#64748B" fontSize={14} fontWeight={600}>Thu nhập</Typography>
                {loading
                  ? <Skeleton variant="text" width={100} height={24} />
                  : <Typography fontWeight={800} fontSize={16} color="#059669">+{Number(stats?.total_income ?? 0).toLocaleString('vi-VN')} ₫</Typography>
                }
              </Paper>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: "1px solid #E2E8F0", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="#64748B" fontSize={14} fontWeight={600}>Chi tiêu</Typography>
                {loading
                  ? <Skeleton variant="text" width={100} height={24} />
                  : <Typography fontWeight={800} fontSize={16} color="#0F172A">-{Number(stats?.total_expense ?? 0).toLocaleString('vi-VN')} ₫</Typography>
                }
              </Paper>
            </Box>
          </Grid>

        </Grid>
      </motion.div>
    </Box>
  );
}

export default Dashboard;
