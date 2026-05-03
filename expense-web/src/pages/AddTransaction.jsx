import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button, MenuItem, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getCategories, getUserWallets, addExpense } from "../services/api";

export default function AddTransaction() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [note, setNote] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0,16));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats.data) ? cats.data : []);
        if (user) {
          const w = await getUserWallets(user.id);
          setWallets(Array.isArray(w.data) ? w.data : (w.data || []));
        }
      } catch (err) {
        console.error("Failed to load categories/wallets", err);
      }
    };
    load();
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return setError("Bạn cần đăng nhập");
    if (!walletId) return setError("Chọn ví");
    if (!categoryId) return setError("Chọn danh mục");
    if (!amount || Number(amount) <= 0) return setError("Số tiền không hợp lệ");

    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        wallet_id: walletId,
        category_id: categoryId,
        type,
        amount: Number(amount),
        note,
        transaction_date: new Date(transactionDate).toISOString().slice(0,19).replace('T',' '),
      };

      await addExpense(payload);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Thêm giao dịch thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ width: 520, p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6">Thêm giao dịch</Typography>
        </Box>
        <Box component="form" onSubmit={submit}>
          <TextField select fullWidth label="Loại" value={type} onChange={(e) => setType(e.target.value)} sx={{ mb: 2 }}>
            <MenuItem value="expense">Chi tiêu</MenuItem>
            <MenuItem value="income">Thu nhập</MenuItem>
          </TextField>

          <TextField fullWidth label="Số tiền" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} sx={{ mb: 2 }} />

          <TextField select fullWidth label="Danh mục" value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} sx={{ mb: 2 }}>
            {categories.map(c => (<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
          </TextField>

          <TextField select fullWidth label="Ví" value={walletId} onChange={(e)=>setWalletId(e.target.value)} sx={{ mb: 2 }}>
            {wallets.length === 0 ? (<MenuItem value="">(Không có ví)</MenuItem>) : wallets.map(w => (<MenuItem key={w.id} value={w.id}>{w.name} — {Number(w.balance).toLocaleString()} VND</MenuItem>))}
          </TextField>

          <TextField fullWidth label="Ghi chú" value={note} onChange={(e)=>setNote(e.target.value)} sx={{ mb: 2 }} />

          <TextField fullWidth label="Thời gian" type="datetime-local" value={transactionDate} onChange={(e)=>setTransactionDate(e.target.value)} sx={{ mb: 2 }} />

          {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}

          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Đang lưu...' : 'Thêm giao dịch'}</Button>
        </Box>
      </Paper>
    </Box>
  );
}
