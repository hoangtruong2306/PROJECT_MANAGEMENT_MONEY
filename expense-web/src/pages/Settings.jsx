import { useState, useEffect } from "react";
import {
    Box, Typography, Avatar, TextField, Button, Alert,
    CircularProgress, Divider, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    InputAdornment,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../contexts/AuthContext";
import {
    updateProfile, changePassword,
    getUserBudgets, createBudget, deleteBudget,
    getCategories,
} from "../services/api";

// ─── Section Tab Sidebar Items ─────────────────────────────────────────────
const SECTIONS = [
    { key: "profile", icon: <PersonIcon />, label: "Hồ sơ cá nhân" },
    { key: "password", icon: <LockIcon />, label: "Bảo mật & Mật khẩu" },
    { key: "budget", icon: <AccountBalanceWalletIcon />, label: "Kiểm soát chi tiêu" },
    { key: "danger", icon: <WarningAmberIcon />, label: "Vùng nguy hiểm" },
];

// ─── Profile Section ───────────────────────────────────────────────────────
function ProfileSection({ user, onUpdate }) {
    const [form, setForm] = useState({ name: user?.full_name || "", email: user?.email || "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handleSave = async () => {
        try {
            setLoading(true);
            setMsg({ type: "", text: "" });
            const res = await updateProfile({ name: form.name, email: form.email });
            onUpdate(res.data.user);
            setMsg({ type: "success", text: "Đã lưu thông tin thành công!" });
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.message || "Cập nhật thất bại." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography fontWeight={700} fontSize={18} mb={0.5}>Hồ sơ cá nhân</Typography>
            <Typography fontSize={13} color="text.secondary" mb={3}>Cập nhật tên và email tài khoản của bạn.</Typography>

            {/* Avatar */}
            <Box display="flex" alignItems="center" gap={2} mb={4}>
                <Avatar
                    sx={{
                        width: 72, height: 72,
                        background: "linear-gradient(135deg, #34d399, #8b5cf6)",
                        fontSize: 28, fontWeight: 700,
                    }}
                >
                    {(user?.full_name || user?.name || "U")[0].toUpperCase()}
                </Avatar>
                <Box>
                    <Typography fontWeight={700} fontSize={16}>{user?.full_name || user?.name}</Typography>
                    <Typography fontSize={13} color="text.secondary">{user?.email}</Typography>
                    <Chip
                        size="small"
                        label={user?.role === "admin" ? "Quản trị viên" : "Thành viên"}
                        sx={{
                            mt: 0.5, height: 20, fontSize: 11, fontWeight: 600,
                            bgcolor: user?.role === "admin" ? "#fef3c7" : "#eef2ff",
                            color: user?.role === "admin" ? "#d97706" : "#34d399",
                        }}
                    />
                </Box>
            </Box>

            {msg.text && <Alert severity={msg.type} sx={{ mb: 2, borderRadius: 3 }}>{msg.text}</Alert>}

            <TextField
                fullWidth
                label="Họ và tên"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{ sx: { borderRadius: 3 } }}
            />
            <TextField
                fullWidth
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                sx={{ mb: 3 }}
                InputProps={{ sx: { borderRadius: 3 } }}
            />
            <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
                sx={{
                    borderRadius: 3, textTransform: "none", fontWeight: 700, px: 3,
                    background: "linear-gradient(135deg, #34d399, #059669)",
                    boxShadow: "0 4px 16px #34d39940",
                }}
            >
                {loading ? "Đang lưu..." : "Lưu thông tin"}
            </Button>
        </Box>
    );
}

// ─── Password Section ──────────────────────────────────────────────────────
function PasswordSection() {
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [show, setShow] = useState({ cur: false, nw: false, cf: false });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handleChange = async () => {
        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            return setMsg({ type: "error", text: "Vui lòng nhập đầy đủ thông tin." });
        }
        if (form.newPassword !== form.confirmPassword) {
            return setMsg({ type: "error", text: "Mật khẩu mới và xác nhận không khớp." });
        }
        if (form.newPassword.length < 6) {
            return setMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
        }
        try {
            setLoading(true);
            setMsg({ type: "", text: "" });
            await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
            setMsg({ type: "success", text: "Đổi mật khẩu thành công! Mật khẩu mới đã được lưu." });
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.message || "Đổi mật khẩu thất bại." });
        } finally {
            setLoading(false);
        }
    };

    const PasswordField = ({ label, field, showKey }) => (
        <TextField
            fullWidth
            label={label}
            type={show[showKey] ? "text" : "password"}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{
                sx: { borderRadius: 3 },
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => setShow({ ...show, [showKey]: !show[showKey] })} edge="end" size="small">
                            {show[showKey] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );

    return (
        <Box>
            <Typography fontWeight={700} fontSize={18} mb={0.5}>Bảo mật & Mật khẩu</Typography>
            <Typography fontSize={13} color="text.secondary" mb={3}>Thay đổi mật khẩu để bảo vệ tài khoản của bạn.</Typography>

            {msg.text && <Alert severity={msg.type} sx={{ mb: 2, borderRadius: 3 }}>{msg.text}</Alert>}

            <PasswordField label="Mật khẩu hiện tại" field="currentPassword" showKey="cur" />
            <Divider sx={{ mb: 2 }} />
            <PasswordField label="Mật khẩu mới" field="newPassword" showKey="nw" />
            <PasswordField label="Xác nhận mật khẩu mới" field="confirmPassword" showKey="cf" />

            <Button
                variant="contained"
                onClick={handleChange}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
                sx={{
                    borderRadius: 3, textTransform: "none", fontWeight: 700, px: 3,
                    background: "linear-gradient(135deg, #34d399, #059669)",
                    boxShadow: "0 4px 16px #34d39940",
                }}
            >
                {loading ? "Đang đổi..." : "Đổi mật khẩu"}
            </Button>
        </Box>
    );
}

// ─── Budget Section ────────────────────────────────────────────────────────
function BudgetSection({ user }) {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ category_id: "", amount: "", period: "monthly" });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        const load = async () => {
            try {
                const [br, cr] = await Promise.all([getUserBudgets(user.id), getCategories()]);
                setBudgets(br.data || []);
                setCategories(cr.data || []);
            } catch { /* silent */ } finally { setLoading(false); }
        };
        load();
    }, [user.id]);

    const handleCreate = async () => {
        if (!form.category_id || !form.amount) {
            return setMsg({ type: "error", text: "Vui lòng chọn danh mục và nhập số tiền." });
        }
        try {
            setSaving(true);
            setMsg({ type: "", text: "" });
            const res = await createBudget({ user_id: user.id, ...form, amount: Number(form.amount) });
            setBudgets((prev) => [res.data, ...prev]);
            setDialogOpen(false);
            setForm({ category_id: "", amount: "", period: "monthly" });
            setMsg({ type: "success", text: "Đã thêm hạn mức chi tiêu!" });
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.error || "Thêm thất bại." });
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        await deleteBudget(id);
        setBudgets((prev) => prev.filter((b) => b.id !== id));
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Typography fontWeight={700} fontSize={18} mb={0.5}>Kiểm soát chi tiêu</Typography>
                    <Typography fontSize={13} color="text.secondary">Đặt hạn mức cho từng danh mục để kiểm soát tốt hơn.</Typography>
                </Box>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setDialogOpen(true)}
                    sx={{
                        borderRadius: 3, textTransform: "none", fontWeight: 700, flexShrink: 0,
                        background: "linear-gradient(135deg, #34d399, #059669)",
                    }}
                >
                    Thêm hạn mức
                </Button>
            </Box>

            {msg.text && <Alert severity={msg.type} sx={{ mb: 2, borderRadius: 3 }}>{msg.text}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
            ) : budgets.length === 0 ? (
                <Box p={5} textAlign="center" sx={{ border: "2px dashed #e5e7eb", borderRadius: 4 }}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 48, color: "#d1d5db", mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>Chưa có hạn mức nào được tạo</Typography>
                    <Typography fontSize={13} color="text.secondary" mt={0.5}>Nhấn "Thêm hạn mức" để bắt đầu kiểm soát chi tiêu!</Typography>
                </Box>
            ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                    {budgets.map((b) => (
                        <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                            <Box
                                display="flex" alignItems="center" gap={2} p={2.5}
                                bgcolor="#f9fafb" borderRadius={4}
                                sx={{ "&:hover": { bgcolor: "#f3f4f6" }, transition: "0.2s" }}
                            >
                                <Box
                                    sx={{
                                        width: 40, height: 40, borderRadius: 3, flexShrink: 0,
                                        background: "linear-gradient(135deg, #34d399, #8b5cf6)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >
                                    <AccountBalanceWalletIcon sx={{ color: "#fff", fontSize: 18 }} />
                                </Box>
                                <Box flex={1}>
                                    <Typography fontWeight={600} fontSize={14}>{b.category_name || "Danh mục"}</Typography>
                                    <Typography fontSize={12} color="text.secondary">
                                        {b.period === "monthly" ? "Hàng tháng" : "Hàng năm"}
                                    </Typography>
                                </Box>
                                <Typography fontWeight={700} fontSize={16} color="#34d399">
                                    {Number(b.amount).toLocaleString()} đ
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDelete(b.id)}
                                    sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" } }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </motion.div>
                    ))}
                </Box>
            )}

            {/* Add Budget Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
            >
                <Box sx={{ background: "linear-gradient(135deg, #34d399, #059669)", px: 3, py: 2.5 }}>
                    <DialogTitle sx={{ p: 0, color: "#fff", fontSize: 16, fontWeight: 700 }}>
                        Thêm hạn mức chi tiêu
                    </DialogTitle>
                </Box>
                <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                    <TextField
                        fullWidth
                        select
                        label="Danh mục"
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        SelectProps={{ native: true }}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                        InputProps={{ sx: { borderRadius: 3 } }}
                    >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label="Hạn mức (VNĐ)"
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        InputProps={{
                            sx: { borderRadius: 3 },
                            endAdornment: <InputAdornment position="end">đ</InputAdornment>,
                        }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Chu kỳ"
                        value={form.period}
                        onChange={(e) => setForm({ ...form, period: e.target.value })}
                        SelectProps={{ native: true }}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ sx: { borderRadius: 3 } }}
                    >
                        <option value="monthly">Hàng tháng</option>
                        <option value="yearly">Hàng năm</option>
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 3, textTransform: "none", color: "text.secondary" }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={saving}
                        sx={{
                            borderRadius: 3, textTransform: "none", fontWeight: 700,
                            background: "linear-gradient(135deg, #34d399, #059669)",
                        }}
                    >
                        {saving ? "Đang lưu..." : "Thêm hạn mức"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// ─── Danger Section ────────────────────────────────────────────────────────
function DangerSection({ user, onLogout }) {
    const loginTime = new Date().toLocaleString("vi-VN");
    return (
        <Box>
            <Typography fontWeight={700} fontSize={18} mb={0.5} color="error.main">Vùng nguy hiểm</Typography>
            <Typography fontSize={13} color="text.secondary" mb={3}>Các hành động không thể khôi phục. Hãy cân nhắc kỹ trước khi thực hiện.</Typography>

            {/* Session info */}
            <Box p={3} mb={3} borderRadius={4} bgcolor="#f9fafb" border="1px solid #f3f4f6">
                <Typography fontWeight={600} fontSize={14} mb={1.5}>Thông tin phiên đăng nhập</Typography>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography fontSize={13} color="text.secondary">Tài khoản</Typography>
                    <Typography fontSize={13} fontWeight={600}>{user?.email}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography fontSize={13} color="text.secondary">Phân quyền</Typography>
                    <Typography fontSize={13} fontWeight={600}>{user?.role === "admin" ? "Quản trị viên" : "Người dùng"}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Typography fontSize={13} color="text.secondary">Thời gian đăng nhập</Typography>
                    <Typography fontSize={13} fontWeight={600}>{loginTime}</Typography>
                </Box>
            </Box>

            {/* Logout */}
            <Box p={3} borderRadius={4} border="1px solid #fee2e2" bgcolor="#fff">
                <Typography fontWeight={600} fontSize={14} color="error.main" mb={0.5}>Đăng xuất khỏi hệ thống</Typography>
                <Typography fontSize={13} color="text.secondary" mb={2}>
                    Token phiên đăng nhập sẽ bị xoá. Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.
                </Typography>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={onLogout}
                    sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700 }}
                >
                    Đăng xuất
                </Button>
            </Box>
        </Box>
    );
}

// ─── Main Settings Page ────────────────────────────────────────────────────
function Settings() {
    const { user, logout } = useAuth();
    const [active, setActive] = useState("profile");
    const [currentUser, setCurrentUser] = useState(user);

    const CONTENT = {
        profile: <ProfileSection user={currentUser} onUpdate={(u) => setCurrentUser(u)} />,
        password: <PasswordSection />,
        budget: <BudgetSection user={currentUser} />,
        danger: <DangerSection user={currentUser} onLogout={logout} />,
    };

    return (
        <Box sx={{ height: "100%", overflowY: "auto", px: 3, py: 3, bgcolor: "#f8fafc" }}>
            <Box mb={3}>
                <Typography fontSize={20} fontWeight={700} color="#111">Cài đặt</Typography>
                <Typography fontSize={13} color="text.secondary">Quản lý tài khoản và tuỳ chỉnh hệ thống</Typography>
            </Box>

            <Box display="flex" gap={3} alignItems="flex-start">
                {/* Sidebar */}
                <Box
                    sx={{
                        width: 240, flexShrink: 0, bgcolor: "#fff",
                        borderRadius: 5, boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        p: 2,
                    }}
                >
                    {SECTIONS.map((s) => (
                        <Box
                            key={s.key}
                            onClick={() => setActive(s.key)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                px: 2,
                                py: 1.4,
                                borderRadius: 3,
                                mb: 0.8,
                                cursor: "pointer",
                                bgcolor: active === s.key ? "#eef2ff" : "transparent",
                                color: active === s.key ? "#34d399" : "text.secondary",
                                transition: "0.15s",
                                "&:hover": {
                                    bgcolor: active === s.key ? "#eef2ff" : "#f5f5f5",
                                    color: active === s.key ? "#34d399" : "#374151",
                                },
                            }}
                        >
                            {/* Fixed-size icon container */}
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    "& .MuiSvgIcon-root": { fontSize: 19 },
                                }}
                            >
                                {s.icon}
                            </Box>
                            <Typography
                                fontSize={13.5}
                                fontWeight={active === s.key ? 700 : 500}
                                noWrap
                            >
                                {s.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Content */}
                <Box flex={1} bgcolor="#fff" borderRadius={5} boxShadow="0 4px 20px rgba(0,0,0,0.06)" p={4}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {CONTENT[active]}
                        </motion.div>
                    </AnimatePresence>
                </Box>
            </Box>
        </Box>
    );
}

export default Settings;
