import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserTransactions, getCategories } from "../../services/api";

const categoryColor = {
  "Ăn uống": "success",
  "Di chuyển": "info",
  "Mua sắm": "primary",
  "Giải trí": "warning",
};

function ExpenseTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [catsRes, txRes] = await Promise.all([getCategories(), getUserTransactions(user.id)]);
        const cats = catsRes.data && (catsRes.data.length ? catsRes.data : []);
        setCategories(cats);

        const txns = txRes.data && (Array.isArray(txRes.data) ? txRes.data : (txRes.data.data || []));
        setTransactions(txns.map(t => ({
          id: t.id,
          date: t.transaction_date,
          categoryId: t.category_id,
          amount: Number(t.amount),
          note: t.note,
        })));
      } catch (err) {
        console.error("Failed to load transactions", err);
        setTransactions([]);
      }
    };

    if (!authLoading) load();
  }, [user, authLoading]);

  const filteredExpenses = transactions.filter((item) => {
    const matchSearch = (item.note || "").toLowerCase().includes(search.toLowerCase());
    const categoryName = (categories.find(c => c.id === item.categoryId) || {}).name || "";
    const matchCategory = category === "all" || categoryName === category;
    return matchSearch && matchCategory;
  });
  return (
    <Box
      px={4}
      py={3}
      borderRadius={5}
      bgcolor="#fff"
      boxShadow="var(--shadow-card)"
      border="1px solid var(--color-border)"
    >
      <Box px={3} pt={2} pb={1} mb={2} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
        {/* TITLE */}
        <Typography fontWeight={600} mb={2}>
          Danh sách giao dịch
        </Typography>
        <Button
          variant="contained"
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 2,
          }}
          onClick={() => window.location.href = '/finance/transaction/new'}
        >
          + Thêm giao dịch

        </Button>
      </Box>
      <Box
        px={3}
        mt={-2}
        mb={2}
        display={"flex"}
        gap={2}
        alignItems={"center"}
      >
        <TextField
          size="small"
          label="Tìm kiếm ghi chú..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          select
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          slotProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  minWidth: 180,
                }
              }
            }
          }}
        >
          <MenuItem value="all">Tất cả danh mục</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer sx={{ maxHeight: 360 }}>
        <Table>
          {/* ===== HEADER ===== */}
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor: "#fff",
              zIndex: 2,
            }}>
            <TableRow>
              <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>
                Ngày
              </TableCell>
              <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>
                Danh mục
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "#6b7280", fontWeight: 600 }}
              >
                Số tiền (VND)
              </TableCell>
              <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>
                Ghi chú
              </TableCell>
            </TableRow>
          </TableHead>

          {/* ===== BODY ===== */}
          <TableBody>
            {filteredExpenses.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "#f9fafb",
                  },
                }}
              >
                {/* DATE */}
                <TableCell sx={{ color: "#6b7280" }}>
                  {new Date(row.date).toLocaleString()}
                </TableCell>

                {/* CATEGORY */}
                <TableCell>
                  {
                    (() => {
                      const name = (categories.find(c => c.id === row.categoryId) || {}).name || "Khác";
                      const color = categoryColor[name] || undefined;
                      return (
                        <Chip
                          label={name}
                          color={color}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      );
                    })()
                  }
                </TableCell>

                {/* AMOUNT */}
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {row.amount.toLocaleString()}
                </TableCell>

                {/* NOTE */}
                <TableCell sx={{ color: "#6b7280" }}>
                  {row.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ExpenseTable;
