import React, { useEffect, useState } from "react";
import {
  Box, Typography, Avatar, Chip, CircularProgress
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useAuth } from "../../contexts/AuthContext";
import { getRecentTransactions } from "../../services/api";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN").format(Number(amount));

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

// Category icon/color lookup
const CATEGORY_COLORS = [
  "#34d399", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
];

function getCategoryColor(name = "") {
  const code = name.charCodeAt(0) || 0;
  return CATEGORY_COLORS[code % CATEGORY_COLORS.length];
}

export default function RecentTransactions({ limit = 6 }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) { setItems([]); setLoading(false); return; }
      try {
        setLoading(true);
        const res = await getRecentTransactions(user.id);
        setItems(res.data.data || res.data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) load();
  }, [user, authLoading]);

  return (
    <Box p={3} bgcolor="#fff" width="100%">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box>
          <Typography fontWeight={700} fontSize={16}>Giao dịch gần đây</Typography>
          <Typography fontSize={12} color="text.secondary">Hoạt động mới nhất của bạn</Typography>
        </Box>
        <Chip
          label={`${items.length} giao dịch`}
          size="small"
          sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 700, fontSize: 12 }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : items.length === 0 ? (
        <Box py={4} textAlign="center">
          <Typography fontSize={32} mb={1}>📭</Typography>
          <Typography color="text.secondary" fontSize={14}>Chưa có giao dịch nào</Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          <AnimatePresence>
            {items.slice(0, limit).map((t, idx) => {
              const isExpense = t.type === "expense";
              const color = getCategoryColor(t.category_name || t.note || "");
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    p={1.5}
                    borderRadius={4}
                    sx={{
                      "&:hover": { bgcolor: "#f9fafb" },
                      transition: "0.15s",
                    }}
                  >
                    {/* Avatar icon */}
                    <Avatar
                      sx={{
                        width: 40, height: 40, flexShrink: 0,
                        bgcolor: `${color}18`,
                        color: color,
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {isExpense ? "↓" : "↑"}
                    </Avatar>

                    {/* Info */}
                    <Box flex={1} minWidth={0}>
                      <Typography fontSize={13.5} fontWeight={600} noWrap>
                        {t.note || t.category_name || (isExpense ? "Chi tiêu" : "Thu nhập")}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {formatDate(t.transaction_date)} · {t.category_name || "Khác"}
                      </Typography>
                    </Box>

                    {/* Amount */}
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {isExpense
                        ? <ArrowDownwardIcon sx={{ fontSize: 14, color: "#ef4444" }} />
                        : <ArrowUpwardIcon sx={{ fontSize: 14, color: "#10b981" }} />
                      }
                      <Typography
                        fontSize={14}
                        fontWeight={700}
                        color={isExpense ? "#ef4444" : "#10b981"}
                        noWrap
                      >
                        {formatCurrency(t.amount)} đ
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
}
