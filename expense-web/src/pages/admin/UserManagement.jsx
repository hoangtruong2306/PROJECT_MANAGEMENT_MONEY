import { useEffect, useState } from "react";
import {
    Box, Typography, Avatar, IconButton, Chip, CircularProgress, Alert,
    Dialog, DialogContent, DialogActions, Button, TextField,
    InputAdornment, Tooltip, Menu, MenuItem, ListItemIcon,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PeopleIcon from "@mui/icons-material/People";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { motion, AnimatePresence } from "framer-motion";
import { getAllUsers, deleteUser, resetUserPassword } from "../../services/admin.service";
import { useAuth } from "../../contexts/AuthContext";

const AVATAR_COLORS = [
    "#34d399", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#ec4899",
];

function getAvatarColor(name = "") {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
        year: "numeric", month: "short", day: "numeric",
    });
}

// ── Styled Dialog header ─────────────────────────────────────────
function DialogHeader({ icon, title, color }) {
    return (
        <Box sx={{
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 2,
        }}>
            <Box sx={{
                width: 38, height: 38, borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", "& .MuiSvgIcon-root": { fontSize: 20 },
            }}>
                {icon}
            </Box>
            <Typography fontSize={16} fontWeight={700} color="#fff">{title}</Typography>
        </Box>
    );
}

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");
    const { user: currentUser } = useAuth();

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await getAllUsers();
            setUsers(res.data);
            setFiltered(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(users.filter(
            (u) => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        ));
    }, [search, users]);

    const showFeedback = (msg) => {
        setFeedback(msg);
        setTimeout(() => setFeedback(""), 3000);
    };

    const handleMenuClick = (e, user) => { setAnchorEl(e.currentTarget); setSelectedUser(user); };
    const handleMenuClose = () => { setAnchorEl(null); setSelectedUser(null); };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;
        try {
            setActionLoading(true);
            await deleteUser(selectedUser.id);
            setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
            showFeedback(`Đã xóa tài khoản "${selectedUser.full_name}"`);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi xóa người dùng");
        } finally {
            setActionLoading(false);
            setDeleteDialogOpen(false);
            handleMenuClose();
        }
    };

    const handlePasswordReset = async () => {
        if (!selectedUser || !newPassword) return;
        try {
            setActionLoading(true);
            await resetUserPassword(selectedUser.id, newPassword);
            showFeedback(`Đổi mật khẩu thành công cho "${selectedUser.full_name}"`);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi đổi mật khẩu");
        } finally {
            setActionLoading(false);
            setPasswordDialogOpen(false);
            setNewPassword("");
            handleMenuClose();
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress sx={{ color: "#34d399" }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* ── Header ──────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                    <Box>
                        <Typography fontSize={24} fontWeight={800} color="#111" mb={0.3}>
                            Quản lý người dùng 👥
                        </Typography>
                        <Typography fontSize={13} color="text.secondary">
                            {users.length} tài khoản đã đăng ký trên hệ thống
                        </Typography>
                    </Box>
                    <Chip
                        icon={<PeopleIcon sx={{ fontSize: "14px !important" }} />}
                        label={`${filtered.length} người dùng`}
                        sx={{ bgcolor: "#eef2ff", color: "#34d399", fontWeight: 700, fontSize: 12, height: 30 }}
                    />
                </Box>
            </motion.div>

            {/* ── Alerts ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError("")}>{error}</Alert>
                    </motion.div>
                )}
                {feedback && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{feedback}</Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Search Bar ──────────────────────────────────────────── */}
            <Box mb={3}>
                <TextField
                    fullWidth
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 4, bgcolor: "#fff", fontSize: 14 },
                    }}
                    sx={{ maxWidth: 500 }}
                />
            </Box>

            {/* ── User Cards Table ─────────────────────────────────────── */}
            <Box
                sx={{
                    bgcolor: "#fff", borderRadius: 5,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                }}
            >
                {/* Table Header */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "2fr 2fr 1fr 1fr 80px",
                        px: 3, py: 1.5,
                        bgcolor: "#f8fafc",
                        borderBottom: "1px solid #f1f5f9",
                    }}
                >
                    {["Người dùng", "Email", "Vai trò", "Ngày tham gia", ""].map((h) => (
                        <Typography key={h} fontSize={12} fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                            {h}
                        </Typography>
                    ))}
                </Box>

                {/* Rows */}
                {filtered.length === 0 ? (
                    <Box py={6} textAlign="center">
                        <Typography fontSize={32} mb={1}>🔍</Typography>
                        <Typography color="text.secondary">Không tìm thấy người dùng nào</Typography>
                    </Box>
                ) : (
                    <AnimatePresence>
                        {filtered.map((row, idx) => {
                            const isCurrentUser = row.id === currentUser?.id;
                            const avatarColor = getAvatarColor(row.full_name || "");

                            return (
                                <motion.div
                                    key={row.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                >
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "2fr 2fr 1fr 1fr 80px",
                                            px: 3, py: 2,
                                            alignItems: "center",
                                            borderBottom: "1px solid #f8fafc",
                                            "&:last-child": { borderBottom: "none" },
                                            "&:hover": { bgcolor: "#fafbff" },
                                            transition: "0.15s",
                                        }}
                                    >
                                        {/* Name */}
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar
                                                sx={{
                                                    width: 38, height: 38, flexShrink: 0,
                                                    background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}cc)`,
                                                    fontSize: 15, fontWeight: 800,
                                                    boxShadow: `0 4px 12px ${avatarColor}40`,
                                                }}
                                            >
                                                {(row.full_name || "U")[0].toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography fontSize={14} fontWeight={600} noWrap>
                                                    {row.full_name}
                                                    {isCurrentUser && (
                                                        <Typography component="span" fontSize={10} color="#34d399" fontWeight={700} ml={0.8}>
                                                            (Bạn)
                                                        </Typography>
                                                    )}
                                                </Typography>
                                                <Typography fontSize={11} color="text.secondary">#{row.id?.slice(0, 8) || row.id}</Typography>
                                            </Box>
                                        </Box>

                                        {/* Email */}
                                        <Typography fontSize={13} color="text.secondary" noWrap>{row.email}</Typography>

                                        {/* Role */}
                                        <Chip
                                            label={row.role === "admin" ? "Quản trị" : "Thành viên"}
                                            size="small"
                                            sx={{
                                                bgcolor: row.role === "admin" ? "#eef2ff" : "#f0fdf4",
                                                color: row.role === "admin" ? "#34d399" : "#16a34a",
                                                fontWeight: 700, fontSize: 11,
                                                width: "fit-content",
                                            }}
                                        />

                                        {/* Date */}
                                        <Typography fontSize={13} color="text.secondary">
                                            {formatDate(row.created_at)}
                                        </Typography>

                                        {/* Action */}
                                        <Box display="flex" justifyContent="flex-end">
                                            <Tooltip title={isCurrentUser ? "Không thể tự quản lý" : "Hành động"} arrow>
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuClick(e, row)}
                                                        disabled={isCurrentUser}
                                                        sx={{
                                                            bgcolor: isCurrentUser ? "transparent" : "#f8fafc",
                                                            "&:hover": { bgcolor: "#eef2ff", color: "#34d399" },
                                                            borderRadius: 2,
                                                        }}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </Box>

            {/* ── Context Menu ─────────────────────────────────────────── */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{ sx: { borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 180 } }}
            >
                <MenuItem onClick={() => { setPasswordDialogOpen(true); setAnchorEl(null); }}
                    sx={{ borderRadius: 2, mx: 0.5, "&:hover": { bgcolor: "#eef2ff", color: "#34d399" } }}>
                    <ListItemIcon><VpnKeyIcon fontSize="small" sx={{ color: "#34d399" }} /></ListItemIcon>
                    <Typography fontSize={13} fontWeight={600}>Đổi mật khẩu</Typography>
                </MenuItem>
                <MenuItem onClick={() => { setDeleteDialogOpen(true); setAnchorEl(null); }}
                    sx={{ borderRadius: 2, mx: 0.5, "&:hover": { bgcolor: "#fff1f2", color: "#ef4444" } }}>
                    <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} /></ListItemIcon>
                    <Typography fontSize={13} fontWeight={600} color="#ef4444">Xóa tài khoản</Typography>
                </MenuItem>
            </Menu>

            {/* ── Delete Confirm Dialog ────────────────────────────────── */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
                <DialogHeader icon={<WarningAmberIcon />} title="Xác nhận xóa tài khoản" color="#ef4444" />
                <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                    <Box p={2} bgcolor="#fff1f2" borderRadius={3} mb={2} border="1px solid #fca5a5">
                        <Typography fontSize={13} color="#dc2626" fontWeight={600}>
                            ⚠️ Hành động không thể hoàn tác!
                        </Typography>
                    </Box>
                    <Typography fontSize={14} color="text.secondary">
                        Bạn sắp xóa tài khoản <strong>{selectedUser?.full_name}</strong> ({selectedUser?.email}).
                        Toàn bộ dữ liệu liên quan (giao dịch, ví, mục tiêu...) sẽ bị xóa vĩnh viễn.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}
                        sx={{ borderRadius: 3, textTransform: "none", color: "text.secondary" }}>
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={actionLoading}
                        sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700 }}>
                        {actionLoading ? <CircularProgress size={18} color="inherit" /> : "Xóa tài khoản"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Password Reset Dialog ────────────────────────────────── */}
            <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
                <DialogHeader icon={<VpnKeyIcon />} title="Đặt lại mật khẩu" color="#34d399" />
                <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                    <Typography fontSize={13} color="text.secondary" mb={2}>
                        Đặt mật khẩu mới cho tài khoản <strong>{selectedUser?.full_name}</strong>
                    </Typography>
                    <TextField
                        autoFocus fullWidth label="Mật khẩu mới" type="password"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        InputProps={{ sx: { borderRadius: 3 } }}
                        helperText="Tối thiểu 6 ký tự"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                    <Button onClick={() => { setPasswordDialogOpen(false); setNewPassword(""); }} disabled={actionLoading}
                        sx={{ borderRadius: 3, textTransform: "none", color: "text.secondary" }}>
                        Hủy
                    </Button>
                    <Button onClick={handlePasswordReset} variant="contained" disabled={!newPassword || actionLoading}
                        sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, #34d399, #059669)" }}>
                        {actionLoading ? <CircularProgress size={18} color="inherit" /> : "Lưu mật khẩu"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
