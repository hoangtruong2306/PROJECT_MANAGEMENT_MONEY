import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import PageCard from "../components/PageCard";

function MainLayout({ children }) {
  return (
    <Box
      sx={{
        p: 3,
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: "flex",
          height: "100%",
          borderRadius: 6,
          bgcolor: "background.paper",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          p: 2,
          gap: 3,
        }}
      >
        <Sidebar />
        <PageCard>{children}</PageCard>
      </Box>
    </Box>
  );
}

export default MainLayout;
