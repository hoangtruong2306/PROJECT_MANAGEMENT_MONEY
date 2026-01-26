import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ChartFilter from "./ChartFilter";

/* ===== MOCK DATA ===== */
const mockChartData = [
  { name: "Ăn uống", current: 1200000, previous: 1000000 },
  { name: "Di chuyển", current: 450000, previous: 520000 },
  { name: "Mua sắm", current: 2300000, previous: 1800000 },
  { name: "Giải trí", current: 800000, previous: 650000 },
  { name: "Khác", current: 400000, previous: 300000 },
];

function ExpenseBarChart() {
  /* ✅ HOOK PHẢI NẰM TRONG COMPONENT */
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2026);
  const [loading, setLoading] = useState(true);

  /* ===== ANIMATION LOAD ===== */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      mt={4}
      px={4}
      pt={4}
      pb={3}
      pl={7}
      borderRadius={6}
      bgcolor="#fff"
      boxShadow="0 6px 20px rgba(0,0,0,0.06)"
    >
      {/* TITLE */}
      <Typography fontWeight={600} mb={2}>
        Biểu đồ chi tiêu theo danh mục
      </Typography>

      {/* ✅ FILTER PHẢI Ở TRONG JSX */}
      <ChartFilter
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
      />

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={loading ? [] : mockChartData}
          margin={{ top: 20, right: 40, left: 30, bottom: 10 }}
          barCategoryGap={28}
          style={{ outline: "none" }}
        >
          {/* ===== GRADIENT ===== */}
          <defs>
            <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6c5ce7" />
              <stop offset="100%" stopColor="#a29bfe" />
            </linearGradient>

            <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d1d5db" />
              <stop offset="100%" stopColor="#f3f4f6" />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 13, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />

          <Tooltip
            cursor={false}
            formatter={(value) =>
              `${Number(value).toLocaleString()} VND`
            }
            contentStyle={{
              borderRadius: 8,
              border: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              fontSize: 13,
            }}
          />

          <Bar
            dataKey="previous"
            fill="url(#previousGradient)"
            radius={[10, 10, 0, 0]}
            maxBarSize={36}
            isAnimationActive
            animationDuration={800}
            activeBar={false}
          />

          <Bar
            dataKey="current"
            fill="url(#currentGradient)"
            radius={[10, 10, 0, 0]}
            maxBarSize={36}
            isAnimationActive
            animationDuration={800}
            activeBar={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default ExpenseBarChart;
