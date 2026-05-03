import { Box, Grid, Typography } from "@mui/material";
import CategoryTable from "./CategoryTable";
import CategoryDonut from "./CategoryDonut.jsx";

function CategoryAnalysis({ categories = [] }) {
  return (
    <Box
      bgcolor="#fff"
      borderRadius={5}
      p={4}
      border="1px solid #E2E8F0"
      mb={4}
    >
      <Typography fontWeight={700} mb={3} fontSize={17}>
        Chi tiêu theo danh mục
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        {/* Table chiếm 6/12 */}
        <Grid item xs={12} md={6}>
          <CategoryTable categories={categories} />
        </Grid>

        {/* Donut chiếm 6/12 - lớn hơn trước */}
        <Grid item xs={12} md={6}>
          <CategoryDonut categories={categories} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default CategoryAnalysis;
