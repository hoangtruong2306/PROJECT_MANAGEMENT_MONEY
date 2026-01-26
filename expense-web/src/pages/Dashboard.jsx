import { Grid, Box, Typography } from "@mui/material";
import StatCard from "../components/StatCard";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseBarChart from "../components/ExpenseBarChart";

function Dashboard() {
  return (
    /* ===== ROOT DASHBOARD (KHÓA HEIGHT – KHÔNG SCROLL) ===== */
    <Box
      sx={{
        height: "100%",
        overflow: "hidden",
        bgcolor: "#f5f7fb",
      }}
    >
      {/* ===== DASHBOARD CONTENT (SCROLL DUY NHẤT) ===== */}
      <Box
        sx={{
          height: "100%",
          overflowY: "auto",
          px: 4,
          py: 3,
        }}
      >
        {/* ===== TITLE ===== */}
        <Typography variant="h5" fontWeight={700} mb={3}>
          Dashboard
        </Typography>

        {/* ===== TOP STATS (FIX GRID OVERFLOW) ===== */}
        <Box overflow="hidden">
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <StatCard
                title="Tổng chi tháng này"
                value="₫5,200,000"
                trend="+12.5%"
                sub="so với tháng trước"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <StatCard
                title="Chi tiêu trung bình/ngày"
                value="₫173,000"
                trend="+2.1%"
                sub="7 ngày gần nhất"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <StatCard
                title="Số giao dịch"
                value="42"
                trend="-1.2%"
                sub="trong tháng"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <StatCard
                title="Ngân sách đã dùng"
                value="78%"
                trend="+5%"
                sub="so với kế hoạch"
              />
            </Grid>
          </Grid>
        </Box>

        {/* ===== BIỂU ĐỒ ===== */}
        <ExpenseBarChart />

        {/* ===== BẢNG CHI TIÊU ===== */}
        <Box mt={4}>
          <ExpenseTable />
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
