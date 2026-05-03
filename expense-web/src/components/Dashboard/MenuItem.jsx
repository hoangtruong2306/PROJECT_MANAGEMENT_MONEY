import { Box, Typography, Tooltip } from "@mui/material";
import { motion } from "framer-motion";

function MenuItem({ icon, text, open, active, onClick }) {
  const item = (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <Box
        onClick={onClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: open ? 1.5 : 0,
          px: open ? 2 : 1.5,
          py: 1.2,
          borderRadius: 3,
          bgcolor: active ? "primary.main" : "transparent",
          color: active ? "#fff" : "text.secondary",
          cursor: "pointer",
          justifyContent: open ? "flex-start" : "center",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: active ? "primary.main" : "#eef2ff",
            color: active ? "#fff" : "primary.main",
          },
        }}
      >
        <Box
          sx={{
            "& .MuiSvgIcon-root": {
              fontSize: 20,
              transition: "0.2s",
            },
          }}
        >
          {icon}
        </Box>
        {open && (
          <Typography
            fontSize={13.5}
            fontWeight={active ? 700 : 500}
            noWrap
          >
            {text}
          </Typography>
        )}
      </Box>
    </motion.div>
  );

  // When collapsed show tooltip
  if (!open) {
    return (
      <Tooltip title={text} placement="right" arrow>
        {item}
      </Tooltip>
    );
  }

  return item;
}

export default MenuItem;
