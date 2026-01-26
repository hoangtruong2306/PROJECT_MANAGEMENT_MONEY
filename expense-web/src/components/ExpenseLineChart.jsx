import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, Typography } from "@mui/material";

/* MOCK DATA: THEO NGÀY */
const mockLineData = [
  { day: "01", amount: 120000 },
  { day: "02", amount: 250000 },
  { day: "03", amount: 180000 },
  { day: "04", amount: 320000 },
  { day: "05", amount: 200000 },
  { day: "06", amount: 150000 },
  { day: "07", amount: 400000 },
];

function ExpenseLineChart() {
  return (
    <Box
      mt={4}
      px={4}
      pt={4}
      pb={3}
      borderRadius={6}
      bgcolor="#fff"
      boxShadow="0 6px 20px rgba(0,0,0,0.06)"
    >
      <Typography fontWeight={600} mb={3} ml={3}>
        Xu hướng chi tiêu theo ngày
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={mockLineData}
          margin={{ top: 20, right: 40, left: 30, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="day"
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
            formatter={(v) => `${v.toLocaleString()} VND`}
            contentStyle={{
              borderRadius: 8,
              border: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              fontSize: 13,
            }}
          />

          <Line
            type="monotone"
            dataKey="amount"
            stroke="#6c5ce7"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default ExpenseLineChart;
