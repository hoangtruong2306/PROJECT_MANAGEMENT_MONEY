import { Box, IconButton, Stack } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";
import MenuItem from "../components/MenuItem";

function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <Box
      sx={{
        width: open ? 220 : 72,
        transition: "0.3s",
        bgcolor: "background.paper",
        borderRadius: 4,
        p: 2,
      }}
    >
      {/* Toggle */}
      <IconButton onClick={() => setOpen(!open)}>
        <MoreHorizIcon />
      </IconButton>

      {/* Menu */}
      <Stack spacing={1} mt={2}>
        <MenuItem icon={<DashboardIcon />} text="Analytics" open={open} />
        <MenuItem icon={<ShoppingCartIcon />} text="Finance" open={open} />
        <MenuItem icon={<BarChartIcon />} text="Reports" open={open} />
        <MenuItem icon={<SettingsIcon />} text="Settings" open={open} />
      </Stack>
    </Box>
  );
}

export default Sidebar;
