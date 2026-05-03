import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SummaryCards from "../components/Analytics/SummaryCards";
import CategoryAnalysis from "../components/Analytics/CategoryAnalysis";
import TrendAnalysis from "../components/Analytics/TrendAnalysis";
import { getUserStats, getCategoryStats, getTrendStats } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { CircularProgress, Alert } from "@mui/material";

function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [statsRes, catRes, trendRes] = await Promise.all([
          getUserStats(user.id),
          getCategoryStats(user.id),
          getTrendStats(user.id),
        ]);
        setStats(statsRes.data?.data || null);
        setCategories(catRes.data?.data || []);
        setTrends(trendRes.data?.data || []);
      } catch (err) {
        setError("Không thể tải dữ liệu phân tích");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  const date = new Date();
  const monthName = date.toLocaleString("vi-VN", { month: "long" });
  const year = date.getFullYear();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", pb: 4 }}>

      {/* ─── Header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" mb={4} gap={2}>
          <Box>
            <Typography fontSize={22} fontWeight={800} color="#0F172A" mb={0.5}>
              Phân tích chi tiêu
            </Typography>
            <Typography fontSize={14} color="#64748B" fontWeight={500}>
              Theo dõi chi tiết số liệu và xu hướng dòng tiền
            </Typography>
          </Box>
          <Chip
            icon={<CalendarMonthIcon sx={{ fontSize: 14 }} />}
            label={`${monthName} · ${year}`}
            size="small"
            sx={{
              bgcolor: "#eef2ff", color: "#34d399",
              fontWeight: 600, fontSize: 11,
              height: 28, flexShrink: 0,
              textTransform: "capitalize",
            }}
          />
        </Box>
      </motion.div>

      {/* ─── Summary Stats ───────────────────────────────────── */}
      <SummaryCards stats={stats} />

      {/* ─── Category Breakdown ──────────────────────────────── */}
      <CategoryAnalysis categories={categories} />

      {/* ─── Trend Chart ─────────────────────────────────────── */}
      <TrendAnalysis stats={stats} trends={trends} />
    </Box>
  );
}

export default Analytics;
