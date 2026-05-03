import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const CARD_THEMES = {
  expense: {
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    bg: "#fff5f5",
    chip: "#fef2f2",
    chipText: "#ef4444",
    icon: "💸",
  },
  balance: {
    gradient: "linear-gradient(135deg, #34d399, #059669)",
    bg: "#f0f4ff",
    chip: "#eef2ff",
    chipText: "#34d399",
    icon: "💰",
  },
  count: {
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    bg: "#f0fdf4",
    chip: "#ecfdf5",
    chipText: "#10b981",
    icon: "📊",
  },
  budget: {
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    bg: "#fffbeb",
    chip: "#fef3c7",
    chipText: "#d97706",
    icon: "🎯",
  },
};

function StatCard({ title, value, trend, sub, variant = "balance" }) {
  const isPositive = trend?.includes("+");
  const isNegative = trend?.includes("-") || trend?.includes("Tăng");
  const theme = CARD_THEMES[variant] || CARD_THEMES.balance;

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 5,
          bgcolor: "#ffffff",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          minHeight: 140,
          border: "1px solid",
          borderColor: "var(--color-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background blob decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: theme.gradient,
            opacity: 0.08,
            pointerEvents: "none",
          }}
        />

        {/* Icon + Title row */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 3,
              background: theme.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {theme.icon}
          </Box>
          <Typography
            color="text.secondary"
            fontSize={13}
            fontWeight={500}
            sx={{ wordBreak: "break-word", lineHeight: 1.3 }}
          >
            {title}
          </Typography>
        </Box>

        {/* Value */}
        <Typography
          fontSize={24}
          fontWeight={800}
          sx={{ lineHeight: 1.2, wordBreak: "break-word" }}
        >
          {value}
        </Typography>

        {/* Trend chip */}
        {(trend || sub) && (
          <Box display="flex" alignItems="center" gap={1} mt="auto">
            {trend && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.3,
                  borderRadius: 2,
                  bgcolor: isPositive ? "#ecfdf5" : isNegative ? "#fef2f2" : "#f3f4f6",
                  color: isPositive ? "#10b981" : isNegative ? "#ef4444" : "#6b7280",
                }}
              >
                {isPositive && <TrendingUpIcon sx={{ fontSize: 13 }} />}
                {isNegative && <TrendingDownIcon sx={{ fontSize: 13 }} />}
                <Typography fontSize={11} fontWeight={700}>{trend}</Typography>
              </Box>
            )}
            {sub && (
              <Typography fontSize={12} color="text.secondary">{sub}</Typography>
            )}
          </Box>
        )}
      </Box>
    </motion.div>
  );
}

export default StatCard;
