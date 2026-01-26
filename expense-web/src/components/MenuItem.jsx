import { Box, Typography } from "@mui/material";

function MenuItem({ icon, text, open, active }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: open ? 2 : 0,
        px: 2,
        py: 1.5,
        borderRadius: 3,
        bgcolor: active ? "primary.main" : "transparent",
        color: active ? "#fff" : "text.primary",
        cursor: "pointer",
        "&:hover": {
          bgcolor: active ? "primary.main" : "#f1f2f6",
        },
      }}
    >
      {icon}
      {open && <Typography>{text}</Typography>}
    </Box>
  );
}

export default MenuItem;
