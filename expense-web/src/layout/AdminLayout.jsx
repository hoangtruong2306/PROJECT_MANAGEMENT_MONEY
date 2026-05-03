import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    Box, Typography, Avatar, IconButton, Tooltip, Divider, Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import ShieldIcon from "@mui/icons-material/Shield";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { text: "Tổng quan", icon: <DashboardIcon />, path: "/admin", desc: "Dashboard & KPIs" },
    { text: "Người dùng", icon: <PeopleIcon />, path: "/admin/users", desc: "Quản lý tài khoản" },
];

function SidebarItem({ item, isSelected, onClick }) {
    return (
        <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
            <Box
                onClick={onClick}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.4,
                    mx: 1.5,
                    borderRadius: 3,
                    cursor: "pointer",
                    mb: 0.5,
                    position: "relative",
                    bgcolor: isSelected ? "rgba(255,255,255,0.15)" : "transparent",
                    color: isSelected ? "#fff" : "rgba(255,255,255,0.55)",
                    border: `1px solid ${isSelected ? "rgba(255,255,255,0.25)" : "transparent"}`,
                    transition: "all 0.2s",
                    "&:hover": {
                        bgcolor: "rgba(255,255,255,0.1)",
                        color: "#fff",
                    },
                }}
            >
                {/* Active indicator bar */}
                {isSelected && (
                    <Box
                        sx={{
                            position: "absolute",
                            left: -4,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 4,
                            height: "60%",
                            borderRadius: 2,
                            bgcolor: "#a5b4fc",
                        }}
                    />
                )}
                <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}>{item.icon}</Box>
                <Box flex={1} minWidth={0}>
                    <Typography fontSize={13.5} fontWeight={isSelected ? 700 : 500} noWrap lineHeight={1.2}>
                        {item.text}
                    </Typography>
                    <Typography fontSize={10} sx={{ opacity: 0.55 }} noWrap>{item.desc}</Typography>
                </Box>
            </Box>
        </motion.div>
    );
}

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const onLogout = () => { logout(); navigate("/login"); };

    return (
        <Box sx={{ display: "flex", bgcolor: "#f1f5f9", minHeight: "100vh" }}>

            {/* ── Dark Sidebar ── */}
            <Box
                sx={{
                    width: 240,
                    flexShrink: 0,
                    background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
                    display: "flex",
                    flexDirection: "column",
                    py: 3,
                    borderRadius: "0 20px 20px 0",
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 100,
                    boxShadow: "6px 0 32px rgba(15,12,41,0.5)",
                }}
            >
                {/* Brand */}
                <Box px={2.5} mb={3}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                            sx={{
                                width: 40, height: 40, borderRadius: 3,
                                background: "linear-gradient(135deg, #34d399, #a855f7)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                            }}
                        >
                            <ShieldIcon sx={{ color: "#fff", fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={800} color="#fff" lineHeight={1.2}>Admin Panel</Typography>
                            <Typography fontSize={10} color="rgba(255,255,255,0.45)">Expense Tracker</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Section label */}
                <Typography
                    fontSize={10}
                    fontWeight={700}
                    color="rgba(255,255,255,0.3)"
                    px={3.5}
                    mb={1}
                    sx={{ textTransform: "uppercase", letterSpacing: 1.5 }}
                >
                    Navigation
                </Typography>

                {/* Nav */}
                <Box flex={1}>
                    {NAV_ITEMS.map((item) => {
                        const isSelected =
                            location.pathname === item.path ||
                            (item.path !== "/admin" && location.pathname.startsWith(item.path));
                        return (
                            <SidebarItem
                                key={item.path}
                                item={item}
                                isSelected={isSelected}
                                onClick={() => navigate(item.path)}
                            />
                        );
                    })}
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2, mb: 2 }} />

                {/* User + actions */}
                <Box px={2}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 2,
                            p: 1.5,
                            borderRadius: 3,
                            bgcolor: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 36, height: 36,
                                background: "linear-gradient(135deg, #34d399, #a855f7)",
                                fontSize: 15, fontWeight: 700, flexShrink: 0,
                            }}
                        >
                            {(user?.full_name || "A")[0].toUpperCase()}
                        </Avatar>
                        <Box minWidth={0} flex={1}>
                            <Typography fontSize={12.5} fontWeight={700} color="#fff" noWrap>
                                {user?.full_name}
                            </Typography>
                            <Chip
                                label="Admin"
                                size="small"
                                sx={{
                                    height: 16, fontSize: 9, fontWeight: 700,
                                    bgcolor: "rgba(99,102,241,0.3)", color: "#a5b4fc",
                                    "& .MuiChip-label": { px: 1 }
                                }}
                            />
                        </Box>
                    </Box>

                    <Box display="flex" gap={1}>
                        <Tooltip title="Quay lại App">
                            <IconButton
                                size="small"
                                onClick={() => navigate("/")}
                                sx={{
                                    flex: 1,
                                    borderRadius: 2,
                                    bgcolor: "rgba(255,255,255,0.07)",
                                    color: "rgba(255,255,255,0.65)",
                                    fontSize: 11,
                                    gap: 0.5,
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.15)", color: "#fff" },
                                }}
                            >
                                <ArrowBackIcon sx={{ fontSize: 16 }} />
                                <Typography fontSize={11} fontWeight={600}>App</Typography>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Đăng xuất">
                            <IconButton
                                size="small"
                                onClick={onLogout}
                                sx={{
                                    flex: 1,
                                    borderRadius: 2,
                                    bgcolor: "rgba(239,68,68,0.12)",
                                    color: "#fca5a5",
                                    gap: 0.5,
                                    "&:hover": { bgcolor: "rgba(239,68,68,0.25)", color: "#fff" },
                                }}
                            >
                                <LogoutIcon sx={{ fontSize: 16 }} />
                                <Typography fontSize={11} fontWeight={600}>Thoát</Typography>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* ── Main Content ── */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: "240px",
                    p: 4,
                    minHeight: "100vh",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
