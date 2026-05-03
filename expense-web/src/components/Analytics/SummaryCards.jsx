import { Grid } from "@mui/material";
import StatCard from "../Dashboard/StatCard";

function SummaryCards({ stats }) {
  if (!stats) return null;

  const currentExpense = Number(stats.expense_this_month) || 0;
  const lastExpense = Number(stats.expense_last_month) || 0;
  const today = new Date().getDate();
  const avgDaily = today > 0 ? currentExpense / today : 0;

  let percentChange = 0;
  if (lastExpense > 0) {
    percentChange = ((currentExpense - lastExpense) / lastExpense) * 100;
  } else if (currentExpense > 0) {
    percentChange = 100;
  }

  const fmt = (val) => new Intl.NumberFormat("vi-VN").format(val);

  const topCategory = stats.top_category || "Chưa có";
  const topCatAmount = Number(stats.top_category_amount) || 0;
  const topCatPercent = currentExpense > 0 ? (topCatAmount / currentExpense) * 100 : 0;

  const isUp = percentChange >= 0;
  const trendStr = isUp
    ? `+${percentChange.toFixed(1)}%`
    : `${percentChange.toFixed(1)}%`;

  return (
    <Grid container spacing={2.5} mb={4}>
      <Grid item xs={12} md={3}>
        <StatCard
          variant="expense"
          title="Tổng chi tiêu tháng này"
          value={`${fmt(currentExpense)} đ`}
          sub="tháng hiện tại"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard
          variant="count"
          title="Trung bình mỗi ngày"
          value={`${fmt(Math.round(avgDaily))} đ`}
          sub="chi tiêu/ngày"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard
          variant="budget"
          title="Danh mục chi nhiều nhất"
          value={topCategory}
          trend={`${topCatPercent.toFixed(1)}%`}
          sub="tổng chi"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard
          variant="balance"
          title="So với tháng trước"
          value={trendStr}
          trend={isUp ? "+Tăng" : "-Giảm"}
          sub="tháng trước"
        />
      </Grid>
    </Grid>
  );
}

export default SummaryCards;
