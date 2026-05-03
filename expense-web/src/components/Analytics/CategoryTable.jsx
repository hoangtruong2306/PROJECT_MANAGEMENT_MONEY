import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar } from "@mui/material";

const COLORS = ["#6c5ce7", "#00b894", "#fdcb6e", "#0984e3", "#e84393", "#e17055", "#00cec9", "#b2bec3"];

function CategoryTable({ categories = [] }) {
  const handleIcon = (iconString) => {
    // Basic emoji fallback or string icon
    return iconString || '🏷️';
  };

  const totalSum = categories.reduce((sum, item) => sum + Number(item.total), 0);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Danh mục</TableCell>
            <TableCell align="right">Số tiền</TableCell>
            <TableCell align="right">%</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center">
                Chưa có dữ liệu giao dịch
              </TableCell>
            </TableRow>
          ) : (
            categories.map((row, index) => {
              const amount = Number(row.total);
              const percent = totalSum > 0 ? ((amount / totalSum) * 100).toFixed(1) : 0;
              return (
                <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: row.color_code || COLORS[index % COLORS.length], fontSize: 16 }}>
                        {handleIcon(row.icon)}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {row.category_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat("vi-VN").format(amount)} ₫
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {percent}%
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CategoryTable;
