import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";

const COLORS = [
  "#34d399", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
  "#f97316", "#3b82f6",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: 4,
          p: 1.5,
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          border: `2px solid ${d.color}`,
          minWidth: 160,
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: d.color }} />
          <Typography fontSize={13} fontWeight={700} color="#0F172A">{d.name}</Typography>
        </Box>
        <Typography fontSize={16} fontWeight={800} color={d.color}>
          {d.percent}%
        </Typography>
        <Typography fontSize={13} color="#64748B" fontWeight={600}>
          {Number(d.value).toLocaleString()} đ
        </Typography>
      </Box>
    );
  }
  return null;
};

function CategoryDonut({ categories = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const totalSum = categories.reduce((sum, c) => sum + Number(c.total), 0);

  const chartData = categories.map((c, i) => ({
    name: c.category_name,
    value: Number(c.total),
    percent: totalSum > 0 ? ((Number(c.total) / totalSum) * 100).toFixed(1) : 0,
    color: c.color_code || COLORS[i % COLORS.length],
  }));

  const fmt = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} Tỷ`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} Tr`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)} K`;
    return v.toLocaleString();
  };

  if (chartData.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={400}>
        <Typography fontSize={48}>📊</Typography>
        <Typography color="text.secondary" fontSize={14} mt={1}>Chưa có dữ liệu</Typography>
      </Box>
    );
  }

  const active = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ width: "100%", py: 2 }}
    >
      <Box position="relative" sx={{ width: 340, height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={0}
              stroke="#fff"
              strokeWidth={3}
              isAnimationActive
              animationDuration={800}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.25}
                  style={{
                    cursor: "pointer",
                    filter: activeIndex === i ? `drop-shadow(0 4px 12px ${entry.color}80)` : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
            width: 140,
          }}
        >
          {active ? (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography fontSize={12} color="#64748B" fontWeight={600} noWrap sx={{ mx: "auto", maxWidth: 130 }}>
                {active.name}
              </Typography>
              <Typography fontSize={32} fontWeight={900} color={active.color} lineHeight={1}>
                {active.percent}%
              </Typography>
              <Typography fontSize={13} color="#0F172A" fontWeight={700}>
                {fmt(active.value)} đ
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography fontSize={13} color="#64748B" fontWeight={600}>Hồ sơ chi tiêu</Typography>
              <Typography fontSize={28} fontWeight={900} color="#0F172A" lineHeight={1}>
                {fmt(totalSum)}
              </Typography>
              <Typography fontSize={13} color="#64748B" fontWeight={600}>VNĐ</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default CategoryDonut;
