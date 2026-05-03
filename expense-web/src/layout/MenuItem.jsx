import { Box, Typography } from "@mui/material";

function MenuItem({ icon, text, open, active, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        height: 48,
        display: "flex",
        alignItems: "center",
        borderRadius: 999,
        cursor: "pointer",
        px: open ? 2 : 0,
        bgcolor: active ? "#f3f4f6" : "transparent",

        "&:hover": {
          bgcolor: "#f3f4f6",
        },

        transition: "background-color 0.2s, padding 0.2s",
      }}
    >
      {/* ICON ZONE – LUÔN CỐ ĐỊNH */}
      <Box
        sx={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      {/* TEXT ZONE */}
      <Box
        sx={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          opacity: open ? 1 : 0,
          width: open ? "auto" : 0,
          transition: "opacity 0.2s, width 0.2s",
        }}
      >
        <Typography fontWeight={500} color="#111827">
          {text}
        </Typography>
      </Box>
    </Box>
  );
}

export default MenuItem;
