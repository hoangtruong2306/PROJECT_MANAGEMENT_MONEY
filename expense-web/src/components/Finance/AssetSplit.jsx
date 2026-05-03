import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const ASSET_CONFIG = [
  { key: "Bank", label: "Ngân hàng", color: "#34d399" },
  { key: "Cash", label: "Tiền mặt", color: "#10b981" },
  { key: "Other", label: "Thẻ & khác", color: "#f59e0b" },
];

function AssetSplit({ wallets = [] }) {
  const totals = { Bank: 0, Cash: 0, Other: 0 };
  let grandTotal = 0;

  wallets.forEach((w) => {
    const bal = Number(w.balance);
    if (bal > 0) {
      if (w.type === "Bank") totals.Bank += bal;
      else if (w.type === "Cash") totals.Cash += bal;
      else totals.Other += bal;
      grandTotal += bal;
    }
  });

  const getPercent = (amount) => {
    if (grandTotal === 0) return 0;
    return Math.round((amount / grandTotal) * 100);
  };

  const pieData = ASSET_CONFIG.map((cfg) => ({
    name: cfg.label,
    value: totals[cfg.key],
    color: cfg.color,
    percent: getPercent(totals[cfg.key]),
  })).filter((d) => d.value > 0);

  const totalLabel = grandTotal.toLocaleString();

  return (
    <Box
      p={3}
      bgcolor="#fff"
      borderRadius={5}
      border="1px solid #E2E8F0"
      height="100%"
    >
      <Typography fontWeight={700} fontSize={16} mb={2}>
        Phân bổ tài sản
      </Typography>

      {grandTotal === 0 ? (
        <Typography color="text.secondary" fontSize={14} mt={2}>
          Chưa có dữ liệu tài sản.
        </Typography>
      ) : (
        <>
          {/* Pie Chart */}
          <Box position="relative" height={180}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} đ`}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              sx={{ transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}
            >
              <Typography fontSize={11} color="text.secondary">Tổng</Typography>
              <Typography fontSize={12} fontWeight={700} color="#111">{totalLabel}</Typography>
            </Box>
          </Box>

          {/* Legend rows */}
          <Box mt={1} display="flex" flexDirection="column" gap={1.5}>
            {ASSET_CONFIG.map((cfg) => {
              const pct = getPercent(totals[cfg.key]);
              if (pct === 0) return null;
              return (
                <Box key={cfg.key} display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: cfg.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography fontSize={13} flex={1} color="text.secondary">{cfg.label}</Typography>
                  <Typography fontSize={13} fontWeight={700} color="#111">{pct}%</Typography>

                  {/* Mini bar */}
                  <Box width={60} height={6} bgcolor="#f3f4f6" borderRadius={3} overflow="hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1 }}
                      style={{ height: "100%", background: cfg.color, borderRadius: 3 }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}

export default AssetSplit;
