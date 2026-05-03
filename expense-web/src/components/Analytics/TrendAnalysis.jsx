import { Box, Typography, Grid } from "@mui/material";
import ExpenseTrendChart from "./ExpenseTrendChart";

function TrendAnalysis({ stats, trends }) {
  const currentExpense = stats ? (Number(stats.expense_this_month) || 0) : 0;
  const lastExpense = stats ? (Number(stats.expense_last_month) || 0) : 0;

  let percentChange = 0;
  if (lastExpense > 0) {
    percentChange = ((currentExpense - lastExpense) / lastExpense) * 100;
  } else if (currentExpense > 0) {
    percentChange = 100;
  }
  const isPositive = percentChange >= 0;

  const topCategory = stats?.top_category || "Chưa có";
  const topCatAmount = stats ? (Number(stats.top_category_amount) || 0) : 0;
  let topCatPercent = 0;
  if (currentExpense > 0) {
    topCatPercent = (topCatAmount / currentExpense) * 100;
  }

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

  return (
    <Box mt={4}>
      {/* ===== PAGE TITLE ===== */}
      <Typography fontWeight={700} fontSize={20} mb={3} ml={2}>
        Phân tích xu hướng chi tiêu
      </Typography>

      <Grid container spacing={3} mb={4}>
        {/* ===== KPI 1: Tổng chi tiêu ===== */}
        <Grid item xs={12} md={4}>
          <Box
            p={3}
            borderRadius={6}
            sx={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Typography fontSize={14} fontWeight={500} color="#64748b">
              💰 Tổng chi tiêu tháng này
            </Typography>

            <Typography fontWeight={700} fontSize={22} mt={1}>
              {formatCurrency(currentExpense)} VND
            </Typography>
          </Box>
        </Grid>

        {/* ===== KPI 2: So với tháng trước ===== */}
        <Grid item xs={12} md={4}>
          <Box
            p={3}
            borderRadius={6}
            sx={{
              background: isPositive ? "linear-gradient(135deg, #ecfdf5, #d1fae5)" : "linear-gradient(135deg, #fef2f2, #fee2e2)",
              border: `1px solid ${isPositive ? "#6ee7b7" : "#fca5a5"}`,
              boxShadow: `0 10px 30px ${isPositive ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 16px 40px ${isPositive ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              },
            }}
          >
            <Typography fontSize={14} fontWeight={500} sx={{ color: isPositive ? "#047857" : "#b91c1c" }}>
              📈 So với tháng trước
            </Typography>

            <Typography
              fontWeight={700}
              fontSize={22}
              mt={1}
              sx={{ color: isPositive ? "#059669" : "#dc2626" }}
            >
              {isPositive ? "+" : ""}{percentChange.toFixed(1)}%
            </Typography>

            <Typography fontSize={13} mt={1} sx={{ color: isPositive ? "#065f46" : "#991b1b" }}>
              {isPositive ? "Tăng so với tháng trước" : "Giảm so với tháng trước"}
            </Typography>
          </Box>
        </Grid>

        {/* ===== KPI 3: Mục chi cao nhất (NỔI BẬT) ===== */}
        <Grid item xs={12} md={4}>
          <Box
            p={3}
            borderRadius={6}
            sx={{
              background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
              border: "1px solid #fdba74",
              boxShadow: "0 12px 32px rgba(249,115,22,0.25)",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 18px 45px rgba(249,115,22,0.35)",
              },
            }}
          >
            <Typography fontSize={14} fontWeight={600} sx={{ color: "#c2410c" }}>
              🔥 Mục chi cao nhất
            </Typography>

            <Typography
              fontWeight={700}
              fontSize={22}
              mt={1}
              sx={{ color: "#ea580c" }}
            >
              {topCategory}
            </Typography>

            <Typography fontSize={14} mt={1} sx={{ color: "#9a3412" }}>
              Chiếm {topCatPercent.toFixed(1)}% tổng chi tiêu
            </Typography>

            {/* Progress bar */}
            <Box mt={2} height={6} borderRadius={4} bgcolor="#fed7aa">
              <Box
                height="100%"
                width={`${topCatPercent}%`}
                borderRadius={4}
                bgcolor="#f97316"
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
      {/* ===== BIỂU ĐỒ XU HƯỚNG (CHÍNH) ===== */}
      <ExpenseTrendChart trends={trends} />

    </Box>
  );
}

export default TrendAnalysis;
