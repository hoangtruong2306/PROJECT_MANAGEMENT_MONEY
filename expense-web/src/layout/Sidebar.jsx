import { Box, IconButton, Stack, Typography, Avatar, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/MenuRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import InsertChartOutlinedRoundedIcon from "@mui/icons-material/InsertChartOutlinedRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import MenuItem from "../components/Dashboard/MenuItem";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { key: "dashboard", icon: <GridViewRoundedIcon />, label: "Bức tranh Tài chính", path: "/" },
  { key: "analytics", icon: <InsertChartOutlinedRoundedIcon />, label: "Biểu đồ", path: "/analytics" },
  { key: "finance", icon: <AccountBalanceWalletOutlinedIcon />, label: "Dòng tiền", path: "/finance" },
  { key: "settings", icon: <SettingsOutlinedIcon />, label: "Tuỳ chỉnh", path: "/settings" },
];

function Sidebar({ active, setActive }) {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      animate={{ width: open ? 200 : 68 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      style={{ flexShrink: 0, overflow: "hidden" }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fff",
          borderRadius: 4,
          py: 2,
          px: 1,
          boxSizing: "border-box",
        }}
      >
        {/* Toggle button */}
        <Box display="flex" justifyContent={open ? "flex-end" : "center"} mb={2} px={1}>
          <IconButton
            onClick={() => setOpen(!open)}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "#ecfdf5", color: "primary.main" },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* User avatar mini */}
        {open && user && (
          <Box px={1} mb={2}>
            <Box display="flex" alignItems="center" gap={1.5} p={1.5} borderRadius={3} bgcolor="#f9fafb">
              <Avatar
                sx={{
                  width: 32, height: 32,
                  background: "linear-gradient(135deg, #34d399, #059669)",
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}
              >
                {(user.full_name || user.name || "U")[0].toUpperCase()}
              </Avatar>
              <Box minWidth={0}>
                <Typography fontSize={12} fontWeight={700} noWrap color="#111">
                  {user.full_name || user.name}
                </Typography>
                <Typography fontSize={10} color="text.secondary" noWrap>
                  {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Nav items */}
        <Stack spacing={0.5} flex={1}>
          {NAV_ITEMS.map((item) => (
            <MenuItem
              key={item.key}
              icon={item.icon}
              text={item.label}
              open={open}
              active={active === item.key}
              onClick={() => {
                setActive(item.key);
                navigate(item.path);
              }}
            />
          ))}

          {user?.role === "admin" && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                icon={<AdminPanelSettingsOutlinedIcon />}
                text="Admin Panel"
                open={open}
                active={active === "admin"}
                onClick={() => {
                  setActive("admin");
                  navigate("/admin");
                }}
              />
            </>
          )}
        </Stack>

        {/* Bottom label */}
        {open && (
          <Box px={1} mt={1}>
            <Typography fontSize={10} color="text.secondary" textAlign="center">
              v1.0.0 • Finance App
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}

export default Sidebar;
