import { Box, Typography, Grid, IconButton } from "@mui/material";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffRounded";

function TotalBalanceCard({ stats }) {
  const [show, setShow] = useState(true);

  const income = Number(stats?.total_income) || 0;
  const expense = Number(stats?.total_expense) || 0;
  const balance = Number(stats?.balance) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.01 }}
    >
      <Box
        p={4}
        borderRadius={5}
        sx={{
          background: "linear-gradient(135deg, #059669 0%, #064E3B 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.4)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Decorative glass circle */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(5, 150, 105, 0.3), rgba(16, 185, 129, 0.1))",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography fontSize={14} fontWeight={500} sx={{ opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>
            Tổng số dư khả dụng
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setShow(!show)}
            sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}
          >
            {show ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
          </IconButton>
        </Box>

        <Typography fontSize={42} fontWeight={800} letterSpacing="-1px">
          {show ? (
            <>
              <CountUp end={balance} duration={1.5} separator="." />
              <Typography component="span" fontSize={20} fontWeight={600} ml={1} sx={{ opacity: 0.8 }}>VND</Typography>
            </>
          ) : (
            "****** VND"
          )}
        </Typography>

        {/* Trend badge */}
        <Box display="flex" alignItems="center" gap={1} mt={1} mb={4}>
          <Box px={1.5} py={0.5} borderRadius={1.5} sx={{ bgcolor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
            <Typography fontSize={12} fontWeight={700}>↑ 12.5%</Typography>
          </Box>
          <Typography fontSize={13} sx={{ opacity: 0.6 }}>so với tháng trước</Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={6} md={4}>
            <Box pl={2} sx={{ borderLeft: "3px solid #10B981" }}>
              <Typography fontSize={12} sx={{ opacity: 0.6, mb: 0.5 }}>Thu nhập tháng này</Typography>
              <Typography fontSize={16} fontWeight={700}>
                {show ? <CountUp end={income} duration={1} separator="." /> : "******"} đ
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={4}>
            <Box pl={2} sx={{ borderLeft: "3px solid #F43F5E" }}>
              <Typography fontSize={12} sx={{ opacity: 0.6, mb: 0.5 }}>Đã chi tiêu</Typography>
              <Typography fontSize={16} fontWeight={700}>
                {show ? <CountUp end={expense} duration={1} separator="." /> : "******"} đ
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
}

export default TotalBalanceCard;
