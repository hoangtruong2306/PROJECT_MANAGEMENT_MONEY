import { Box } from "@mui/material";

function PageCard({ children }) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "#f5f6fa", // 👈 TRẮNG ĐỤC
        borderRadius: 6,
        p: 4,
        boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        height: "100%",
        overflow: "auto",
      }}
    >
      {children}
    </Box>
  );
}

export default PageCard;
