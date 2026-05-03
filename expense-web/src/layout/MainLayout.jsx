import { Box, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/MenuRounded";
import Sidebar from "./Sidebar";
import PageCard from "../components/Dashboard/PageCard";
import { useState, useEffect } from "react";
import FloatingAction from "../components/Finance/FloatingAction";
import { Outlet, useLocation } from "react-router-dom";
import Chatbot from "../components/Chatbot/Chatbot";

function MainLayout() {
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const p = location.pathname || "/";
    if (p.startsWith("/analytics")) setActive("analytics");
    else if (p.startsWith("/finance")) setActive("finance");
    else if (p.startsWith("/settings")) setActive("settings");
    else setActive("dashboard");
  }, [location.pathname]);

  // Đóng drawer khi chuyển trang trên mobile
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <Box sx={{ p: { xs: 0, md: 3 }, height: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          borderRadius: { xs: 0, md: 6 },
          bgcolor: "background.paper",
          boxShadow: { xs: "none", md: "0 10px 40px rgba(0,0,0,0.08)" },
          p: { xs: 0, md: 2 },
          gap: { xs: 0, md: 3 },
          overflow: "hidden",
        }}
      >
        {/* Sidebar desktop — ẩn trên mobile */}
        {!isMobile && <Sidebar active={active} setActive={setActive} />}

        {/* Sidebar mobile — dùng Drawer */}
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: 220, boxSizing: "border-box", p: 1 },
          }}
        >
          <Sidebar active={active} setActive={setActive} />
        </Drawer>

        {/* Content area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Mobile top bar */}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1.5,
                bgcolor: "#fff",
                borderBottom: "1px solid #E2E8F0",
                flexShrink: 0,
              }}
            >
              <IconButton
                onClick={() => setMobileOpen(true)}
                size="small"
                sx={{ color: "text.secondary", mr: 1 }}
                aria-label="Mở menu"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          <PageCard>
            <Outlet />
          </PageCard>
        </Box>

        <FloatingAction active={active} />
      </Box>
      <Chatbot />
    </Box>
  );
}

export default MainLayout;
