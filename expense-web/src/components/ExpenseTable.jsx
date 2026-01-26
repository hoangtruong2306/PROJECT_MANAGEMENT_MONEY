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
} from "@mui/material";
import { useState } from "react";
import { MenuItem } from "@mui/material";


const mockExpenses = [
  {
    date: "2026-01-12",
    category: "Ăn uống",
    amount: 120000,
    note: "Cơm trưa",
  },
  {
    date: "2026-01-12",
    category: "Di chuyển",
    amount: 50000,
    note: "Grab",
  },
  {
    date: "2026-01-11",
    category: "Mua sắm",
    amount: 320000,
    note: "Quần áo",
  },
  {
    date: "2026-01-10",
    category: "Giải trí",
    amount: 150000,
    note: "Xem phim",
  },
];

const categoryColor = {
  "Ăn uống": "success",
  "Di chuyển": "info",
  "Mua sắm": "primary",
  "Giải trí": "warning",
};

function ExpenseTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredExpenses = mockExpenses.filter((item) => {
    const matchSearch = item.note
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "all" || item.category === category;

    return matchSearch && matchCategory;
  });
  return (
    <Box
      px={4}
      py={3}
      borderRadius={6}
      bgcolor="#fff"
      boxShadow="0 6px 20px rgba(0,0,0,0.06)"
    >
    <Box px={3} mb={2} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
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
    >
      + Thêm giao dịch

      </Button>
    </Box>
    <Box 
      px ={3}
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
            MenuProps:{
              PaperProps: {
                sx:{
                  minWidth: 180,
                }
              }
            }
          }}
          >
          <MenuItem value="all">Tất cả danh mục</MenuItem>
          <MenuItem value="Ăn uống">Ăn uống</MenuItem>
          <MenuItem value="Di chuyển">Di chuyển</MenuItem>
          <MenuItem value="Mua sắm">Mua sắm</MenuItem>
          <MenuItem value="Giải trí">Giải trí</MenuItem>
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
            {filteredExpenses.map((row, index) => (
              <TableRow
                key={index}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "#f9fafb",
                  },
                }}
              >
                {/* DATE */}
                <TableCell sx={{ color: "#6b7280" }}>
                  {row.date}
                </TableCell>

                {/* CATEGORY */}
                <TableCell>
                  <Chip
                    label={row.category}
                    color={categoryColor[row.category]}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
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
