import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Box, Typography } from "@mui/material";

function ExpenseTrendChart({ trends = [] }) {
  return (
    <Box p={3} pb={2} bgcolor="#fff" width="100%">
      <Typography fontWeight={700} mb={3} fontSize={18} ml={2}>
        Xu hướng chi tiêu (6 tháng gần nhất)
      </Typography>

      <Box
        sx={{
          width: "100%",
          height: 360,
          "& svg, & svg:focus": { outline: "none" },
          "& .recharts-wrapper": { outline: "none" },
          "& .recharts-tooltip-wrapper": { outline: "none" },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trends}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
          >
            <defs>
              <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#059669" floodOpacity="0.2" />
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#E2E8F0"
              opacity={0.6}
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />

            <YAxis
              tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={65}
              dx={-10}
              tickFormatter={(value) => {
                if (value >= 1_000_000) return `${(value / 1_000_000).toPrecision(2)}Tr`;
                if (value >= 1_000) return `${value / 1_000}K`;
                return value;
              }}
            />

            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} ₫`]}
              labelStyle={{ fontWeight: 700, color: "#0F172A", marginBottom: 4 }}
              contentStyle={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                fontSize: 14,
                padding: "12px 20px",
                backgroundColor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
              }}
              cursor={{ stroke: "#059669", strokeWidth: 1, strokeDasharray: "4 4" }}
            />

            <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, fontSize: 13, fontWeight: 600, color: "#475569" }} />

            <Area
              name="Năm ngoái"
              type="monotone"
              dataKey="previous"
              stroke="#94A3B8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradPrevious)"
              dot={false}
              activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2, fill: "#94A3B8" }}
            />

            <Area
              name="Năm nay"
              type="monotone"
              dataKey="current"
              stroke="#059669"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#gradCurrent)"
              style={{ filter: "url(#shadow)" }}
              dot={false}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 3, fill: "#059669" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default ExpenseTrendChart;
