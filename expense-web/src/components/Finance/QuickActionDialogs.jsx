import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, InputAdornment,
    Box, Typography, Alert, CircularProgress,
    ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SavingsIcon from "@mui/icons-material/Savings";
import TuneIcon from "@mui/icons-material/Tune";
import { useAuth } from "../../contexts/AuthContext";
import {
    addExpense, getCategories, getUserWallets,
    createGoal, createBudget,
} from "../../services/api";
import API from "../../services/api";

// ── Helper: Styled Dialog header ─────────────────────────────────
function DialogHeader({ icon, title, subtitle, color = "#059669" }) {
    return (
        <Box
            sx={{
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 2,
            }}
        >
            <Box
                sx={{
                    width: 40, height: 40, borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", "& .MuiSvgIcon-root": { fontSize: 22 },
                }}
            >
                {icon}
            </Box>
            <Box>
                <DialogTitle sx={{ p: 0, color: "#fff", fontSize: 16, fontWeight: 700 }}>
                    {title}
                </DialogTitle>
                {subtitle && (
                    <Typography fontSize={12} sx={{ color: "rgba(255,255,255,0.75)" }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

// ── 1. Thêm giao dịch ────────────────────────────────────────────
export function AddTransactionDialog({ open, onClose, onSuccess }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        type: "expense", amount: "", category_id: "", wallet_id: "",
        note: "", transaction_date: new Date().toISOString().slice(0, 10),
    });
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !user) return;
        Promise.all([getCategories(), getUserWallets(user.id)])
            .then(([catRes, walRes]) => {
                setCategories(catRes.data || []);
                setWallets(Array.isArray(walRes.data) ? walRes.data : []);
            })
            .catch(console.error);
    }, [open, user]);

    const handleSubmit = async () => {
        if (!form.amount || !form.category_id || !form.wallet_id) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await addExpense({ ...form, user_id: user.id });
            onSuccess?.();
            onClose();
            setForm({ type: "expense", amount: "", category_id: "", wallet_id: "", note: "", transaction_date: new Date().toISOString().slice(0, 10) });
        } catch (e) {
            setError(e?.response?.data?.error || "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 5, overflow: "hidden" } }}>
            <DialogHeader icon={<AddCardIcon />} title="Thêm giao dịch" subtitle="Ghi lại khoản thu hoặc chi của bạn" />
            <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                {/* Thu / Chi toggle */}
                <ToggleButtonGroup
                    value={form.type} exclusive fullWidth size="small"
                    onChange={(_, v) => v && setForm({ ...form, type: v })}
                    sx={{ mb: 2 }}
                >
                    <ToggleButton value="income" sx={{
                        borderRadius: "10px 0 0 10px !important", fontWeight: 700,
                        "&.Mui-selected": { bgcolor: "#dcfce7", color: "#16a34a", borderColor: "#86efac" },
                    }}>
                        ↑ Thu nhập
                    </ToggleButton>
                    <ToggleButton value="expense" sx={{
                        borderRadius: "0 10px 10px 0 !important", fontWeight: 700,
                        "&.Mui-selected": { bgcolor: "#fee2e2", color: "#dc2626", borderColor: "#fca5a5" },
                    }}>
                        ↓ Chi tiêu
                    </ToggleButton>
                </ToggleButtonGroup>

                <TextField fullWidth label="Số tiền *" type="number" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    sx={{ mb: 2 }} />

                <TextField fullWidth select label="Danh mục *" value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    InputProps={{ sx: { borderRadius: 3 } }} sx={{ mb: 2 }}>
                    <MenuItem value=""><em>Chọn danh mục</em></MenuItem>
                    {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>

                <TextField fullWidth select label="Ví *" value={form.wallet_id}
                    onChange={(e) => setForm({ ...form, wallet_id: e.target.value })}
                    InputProps={{ sx: { borderRadius: 3 } }} sx={{ mb: 2 }}>
                    <MenuItem value=""><em>Chọn ví</em></MenuItem>
                    {wallets.map((w) => (
                        <MenuItem key={w.id} value={w.id}>
                            {w.name} · {Number(w.balance).toLocaleString()}đ
                        </MenuItem>
                    ))}
                </TextField>

                <TextField fullWidth label="Ngày" type="date" value={form.transaction_date}
                    onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                    InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: 3 } }} sx={{ mb: 2 }} />

                <TextField fullWidth label="Ghi chú" value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    InputProps={{ sx: { borderRadius: 3 } }} multiline rows={2} />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                <Button onClick={onClose} sx={{ borderRadius: 3, textTransform: "none", color: "text.secondary" }}>Hủy</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving}
                    sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, #059669, #34d399)", boxShadow: "0 4px 14px rgba(79,70,229,0.25)" }}>
                    {saving ? <CircularProgress size={18} color="inherit" /> : "Lưu giao dịch"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── 2. Thêm tài khoản/ví ─────────────────────────────────────────
const WALLET_TYPES = [
    { value: "cash", label: "💵 Tiền mặt" },
    { value: "bank", label: "🏦 Tài khoản ngân hàng" },
    { value: "e-wallet", label: "📱 Ví điện tử" },
    { value: "credit", label: "💳 Thẻ tín dụng" },
];

export function AddWalletDialog({ open, onClose, onSuccess }) {
    const { user } = useAuth();
    const [form, setForm] = useState({ name: "", type: "cash", balance: "", currency: "VND" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!form.name) { setError("Vui lòng nhập tên ví"); return; }
        setSaving(true); setError("");
        try {
            await API.post("/wallets", { ...form, user_id: user.id, balance: Number(form.balance) || 0 });
            onSuccess?.();
            onClose();
            setForm({ name: "", type: "cash", balance: "", currency: "VND" });
        } catch (e) {
            setError(e?.response?.data?.error || "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
            <DialogHeader icon={<AccountBalanceWalletIcon />} title="Thêm tài khoản" subtitle="Tạo ví mới để theo dõi tài chính" color="#10b981" />
            <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                <TextField fullWidth label="Tên ví *" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    InputProps={{ sx: { borderRadius: 3 } }} sx={{ mb: 2 }}
                    placeholder="VD: Ví tiền mặt, BIDV..." />
                <TextField fullWidth select label="Loại ví" value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    InputProps={{ sx: { borderRadius: 3 } }} sx={{ mb: 2 }}>
                    {WALLET_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </TextField>
                <TextField fullWidth label="Số dư ban đầu" type="number" value={form.balance}
                    onChange={(e) => setForm({ ...form, balance: e.target.value })}
                    InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    sx={{ mb: 2 }} />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                <Button onClick={onClose} sx={{ borderRadius: 3, textTransform: "none", color: "text.secondary" }}>Hủy</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving}
                    sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, #10b981, #059669)" }}>
                    {saving ? <CircularProgress size={18} color="inherit" /> : "Thêm tài khoản"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── 3. Tạo mục tiêu tiết kiệm ────────────────────────────────────
export function AddGoalDialog({ open, onClose, onSuccess }) {
    const { user } = useAuth();
    const [form, setForm] = useState({ name: "", target_amount: "", current_amount: "", deadline: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!form.name || !form.target_amount) { setError("Vui lòng nhập tên và số tiền mục tiêu"); return; }
        setSaving(true); setError("");
        try {
            await createGoal({ ...form, user_id: user.id, target_amount: Number(form.target_amount), current_amount: Number(form.current_amount) || 0 });
            onSuccess?.();
            onClose();
            setForm({ name: "", target_amount: "", current_amount: "", deadline: "" });
        } catch (e) {
            setError(e?.response?.data?.error || "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
            <DialogHeader icon={<SavingsIcon />} title="Tạo mục tiêu tiết kiệm" subtitle="Đặt ra mục tiêu tài chính của bạn" color="#f59e0b" />
            <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                <TextField fullWidth label="Tên mục tiêu *" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    InputProps={{ sx: { borderRadius: 3 } }} sx={{ mb: 2 }}
                    placeholder="VD: Mua xe, Du lịch Nhật Bản..." />
                <TextField fullWidth label="Số tiền mục tiêu *" type="number" value={form.target_amount}
                    onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                    InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    sx={{ mb: 2 }} />
                <TextField fullWidth label="Số tiền hiện có" type="number" value={form.current_amount}
                    onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
                    InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    sx={{ mb: 2 }} helperText="Để trống nếu bắt đầu từ 0" />
                <TextField fullWidth label="Hạn hoàn thành" type="date" value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: 3 } }} />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                <Button onClick={onClose} sx={{ borderRadius: 3, textTransform: "none", color: "text.secondary" }}>Hủy</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving}
                    sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                    {saving ? <CircularProgress size={18} color="inherit" /> : "Tạo mục tiêu"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── 4. Chỉnh ngân sách ───────────────────────────────────────────
export function AddBudgetDialog({ open, onClose, onSuccess }) {
    const { user } = useAuth();
    const [form, setForm] = useState({ category_id: "", amount: "", period: "monthly" });
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        getCategories().then((res) => setCategories(res.data || [])).catch(console.error);
    }, [open]);

    const handleSubmit = async () => {
        if (!form.category_id || !form.amount) { setError("Vui lòng chọn danh mục và nhập hạn mức"); return; }
        setSaving(true); setError("");
        try {
            await createBudget({ ...form, user_id: user.id, amount: Number(form.amount) });
            onSuccess?.();
            onClose();
            setForm({ category_id: "", amount: "", period: "monthly" });
        } catch (e) {
            setError(e?.response?.data?.error || "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
            <DialogHeader icon={<TuneIcon />} title="Chỉnh ngân sách" subtitle="Đặt hạn mức chi tiêu theo danh mục" color="#8b5cf6" />
            <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                <TextField fullWidth select label="Danh mục *" value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    InputProps={{ sx: { borderRadius: 3 } }} sx={{ mb: 2 }}>
                    <MenuItem value=""><em>Chọn danh mục</em></MenuItem>
                    {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
                <TextField fullWidth label="Hạn mức *" type="number" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    sx={{ mb: 2 }} />
                <TextField fullWidth select label="Chu kỳ" value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    InputProps={{ sx: { borderRadius: 3 } }}>
                    <MenuItem value="monthly">📅 Hàng tháng</MenuItem>
                    <MenuItem value="yearly">📆 Hàng năm</MenuItem>
                </TextField>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                <Button onClick={onClose} sx={{ borderRadius: 3, textTransform: "none", color: "text.secondary" }}>Hủy</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving}
                    sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                    {saving ? <CircularProgress size={18} color="inherit" /> : "Lưu ngân sách"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
