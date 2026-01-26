import { Box, MenuItem, Select } from "@mui/material";

function ChartFilter({ month, year, onMonthChange, onYearChange }) {
  return (
    <Box display="flex" gap={2} mb={2}>
      <Select
        size="small"
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
      >
        {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
          <MenuItem key={m} value={m}>
            Tháng {m}
          </MenuItem>
        ))}
      </Select>

      <Select
        size="small"
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
      >
        {[2024, 2025, 2026].map((y) => (
          <MenuItem key={y} value={y}>
            Năm {y}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

export default ChartFilter;
