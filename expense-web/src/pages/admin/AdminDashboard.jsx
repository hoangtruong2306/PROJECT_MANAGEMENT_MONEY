import { useEffect, useState } from "react";
import {
    Box, Grid, Typography, CircularProgress, Alert, Chip,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { getAdminStats } from "../../services/admin.service";

const STAT_CONFIG = [
    {
        key: "totalUsers",
        title: "Tổng người dùng",
        icon: <PeopleIcon />,
        gradient: "linear-gradient(135deg, #34d399, #059669)",
        bg: "#eef2ff",
        emoji: "👥",
        suffix: "",
    },
    {
        key: "totalTransactions",
        title: "Tổng giao dịch",
        icon: <ReceiptIcon />,
        gradient: "linear-gradient(135deg, #10b981, #059669)",
        bg: "#ecfdf5",
        emoji: "💳",
        suffix: "",
    },
    {
        key: "totalWallets",
        title: "Tổng số ví",
        icon: <AccountBalanceWalletIcon />,
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        bg: "#fffbeb",
        emoji: "👛",
        suffix: "",
    },
    {
        key: "totalVolume",
        title: "Tổng khối lượng",
        icon: <MonetizationOnIcon />,
        gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
        bg: "#fff1f2",
        emoji: "💰",
        suffix: "",
        isCurrency: true,
    },
];

function StatCard({ config, value, index }) {
    const displayVal = config.isCurrency
        ? Math.round((value || 0) / 1_000_000)
        : value || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            whileHover={{ y: -5 }}
        >
            <Box
                sx={{
                    p: 3,
                    borderRadius: 5,
                    bgcolor: "#fff",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    border: "1px solid #f3f4f6",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background blob */}
                <Box
                    sx={{
                        position: "absolute", top: -20, right: -20,
                        width: 90, height: 90, borderRadius: "50%",
                        background: config.gradient, opacity: 0.08,
                        pointerEvents: "none",
                    }}
                />

                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                        <Typography fontSize={13} color="text.secondary" fontWeight={500} mb={1}>
                            {config.title}
                        </Typography>
                        <Typography fontSize={30} fontWeight={800} lineHeight={1}>
                            <CountUp end={displayVal} separator="," duration={1.5} />
                            {config.isCurrency && (
                                <Typography component="span" fontSize={16} fontWeight={600} color="text.secondary" ml={0.5}>
                                    triệu đ
                                </Typography>
                            )}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 48, height: 48, borderRadius: 3.5,
                            background: config.gradient,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", flexShrink: 0,
                            boxShadow: `0 8px 20px ${config.gradient.includes("#34d399") ? "rgba(99,102,241,0.4)" : config.gradient.includes("#10b981") ? "rgba(16,185,129,0.4)" : config.gradient.includes("#f59e0b") ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.4)"}`,
                            "& .MuiSvgIcon-root": { fontSize: 24 },
                        }}
                    >
                        {config.icon}
                    </Box>
                </Box>

                <Typography fontSize={12} color="text.secondary" mt={2}>
                    {config.emoji} Cập nhật theo thời gian thực
                </Typography>
            </Box>
        </motion.div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const now = new Date();
    const todayStr = now.toLocaleDateString("vi-VN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    useEffect(() => {
        getAdminStats()
            .then((res) => setStats(res.data))
            .catch((err) => setError(err.response?.data?.message || err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress sx={{ color: "#34d399" }} />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>;
    }

    return (
        <Box>
            {/* ── Header ────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                    <Box>
                        <Typography fontSize={24} fontWeight={800} color="#111" mb={0.3}>
                            Bảng điều khiển 🛡️
                        </Typography>
                        <Typography fontSize={13} color="text.secondary">
                            Thống kê tổng quan hệ thống và hoạt động nền tảng
                        </Typography>
                    </Box>
                    <Chip
                        label={todayStr}
                        size="small"
                        sx={{ bgcolor: "#eef2ff", color: "#34d399", fontWeight: 600, fontSize: 11, height: 28 }}
                    />
                </Box>
            </motion.div>

            {/* ── Stat Cards ────────────────────────────────────────── */}
            <Grid container spacing={3} mb={4}>
                {STAT_CONFIG.map((cfg, i) => (
                    <Grid item xs={12} sm={6} md={3} key={cfg.key}>
                        <StatCard config={cfg} value={stats?.[cfg.key]} index={i} />
                    </Grid>
                ))}
            </Grid>

            {/* ── System Status ─────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <Box p={3.5} bgcolor="#fff" borderRadius={5} boxShadow="0 4px 20px rgba(0,0,0,0.06)" mb={3}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 22 }} />
                        <Typography fontWeight={700} fontSize={16}>Tình trạng hệ thống</Typography>
                        <Chip label="Bình thường" size="small"
                            sx={{ bgcolor: "#ecfdf5", color: "#10b981", fontWeight: 700, fontSize: 11, ml: "auto" }} />
                    </Box>

                    <Grid container spacing={2}>
                        {[
                            { label: "API Server", status: "Hoạt động", color: "#10b981", dot: "#10b981" },
                            { label: "Database", status: "Kết nối", color: "#10b981", dot: "#10b981" },
                            { label: "Auth Service", status: "Hoạt động", color: "#10b981", dot: "#10b981" },
                            { label: "Scheduler", status: "Standby", color: "#f59e0b", dot: "#f59e0b" },
                        ].map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item.label}>
                                <Box
                                    p={2} borderRadius={3} bgcolor="#f9fafb"
                                    display="flex" alignItems="center" gap={1.5}
                                >
                                    <Box
                                        sx={{
                                            width: 8, height: 8, borderRadius: "50%",
                                            bgcolor: item.dot,
                                            boxShadow: `0 0 8px ${item.dot}80`,
                                        }}
                                    />
                                    <Box>
                                        <Typography fontSize={12} fontWeight={600}>{item.label}</Typography>
                                        <Typography fontSize={11} color={item.color} fontWeight={600}>{item.status}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </motion.div>

            {/* ── Quick Info Banner ──────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
            >
                <Box
                    p={3}
                    borderRadius={5}
                    sx={{
                        background: "linear-gradient(135deg, #1e1b4b, #4338ca)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Box>
                        <Typography fontSize={15} fontWeight={700} mb={0.3}>
                            Mọi thứ đang hoạt động tốt 🚀
                        </Typography>
                        <Typography fontSize={12} sx={{ color: "rgba(255,255,255,0.65)" }}>
                            Hệ thống ổn định · Không có cảnh báo · {now.toLocaleTimeString("vi-VN")}
                        </Typography>
                    </Box>
                    <Box fontSize={36}>✅</Box>
                </Box>
            </motion.div>
        </Box>
    );
}
