import { Box, Typography, Chip } from "@mui/material";

function StatCard({ title, value, trend, sub }) {
  const isPositive = trend?.includes("+");

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: "#ffffff",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minHeight: 140,

        /* ===== TRANSITION ===== */
        transition: "all 0.25s ease",

        /* ===== HOVER EFFECT ===== */
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* TITLE */}
      <Typography
        color="text.secondary"
        fontSize={14}
        sx={{ wordBreak: "break-word" }}
      >
        {title}
      </Typography>

      {/* VALUE */}
      <Typography
        fontSize={28}
        fontWeight={600}
        sx={{
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>

      {/* TREND */}
      <Box display="flex" alignItems="center" gap={1} mt="auto">
        <Chip
          size="small"
          label={trend}
          sx={{
            bgcolor: isPositive ? "#e6f9f0" : "#fdecec",
            color: isPositive ? "#10b981" : "#ef4444",
            fontWeight: 500,
          }}
        />
        <Typography fontSize={13} color="text.secondary">
          {sub}
        </Typography>
      </Box>
    </Box>
  );
}

export default StatCard;
