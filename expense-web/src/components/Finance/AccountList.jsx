import { Box, Typography, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";

const TYPE_CONFIG = {
  Bank: {
    label: "Ngân hàng",
    icon: <AccountBalanceIcon sx={{ fontSize: 18, color: "#fff" }} />,
    gradient: "linear-gradient(135deg, #34d399, #059669)",
  },
  Cash: {
    label: "Tiền mặt",
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 18, color: "#fff" }} />,
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
  Credit: {
    label: "Thẻ tín dụng",
    icon: <CreditCardIcon sx={{ fontSize: 18, color: "#fff" }} />,
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
  },
};

function AccountList({ wallets = [] }) {
  if (wallets.length === 0) {
    return (
      <Box p={4} bgcolor="#fff" borderRadius={5} boxShadow="0 4px 20px rgba(0,0,0,0.06)">
        <Typography fontWeight={700} fontSize={16} mb={2}>Tài khoản của tôi</Typography>
        <Typography color="text.secondary" fontSize={14}>Chưa có tài khoản nào được tạo.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} bgcolor="#fff" borderRadius={5} border="1px solid #E2E8F0">
      <Typography fontWeight={700} fontSize={16} mb={3}>
        Tài khoản của tôi
      </Typography>

      {wallets.map((acc, index) => {
        const config = TYPE_CONFIG[acc.type] || TYPE_CONFIG["Cash"];
        const income = Number(acc.total_income || 0);
        const expense = Number(acc.total_expense || 0);
        const balance = Number(acc.balance);

        return (
          <motion.div
            key={acc.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ x: 4 }}
          >
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              py={1.5}
              sx={{
                borderBottom: index < wallets.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              {/* Icon */}
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  background: config.gradient,
                  borderRadius: 3,
                  flexShrink: 0,
                }}
              >
                {config.icon}
              </Avatar>

              {/* Name & type */}
              <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize={15} noWrap>
                  {acc.name}
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  {config.label}
                </Typography>
              </Box>

              {/* Income / Expense mini */}
              <Box display="flex" flexDirection="column" alignItems="flex-end" mr={1.5}>
                <Typography fontSize={11} sx={{ color: "#10b981", fontWeight: 600, lineHeight: 1.4 }}>
                  +{income.toLocaleString()} đ
                </Typography>
                <Typography fontSize={11} sx={{ color: "#ef4444", fontWeight: 600, lineHeight: 1.4 }}>
                  -{expense.toLocaleString()} đ
                </Typography>
              </Box>

              {/* Balance */}
              <Box textAlign="right">
                <Typography
                  fontWeight={700}
                  fontSize={15}
                  color={balance < 0 ? "error.main" : "#111"}
                >
                  {balance.toLocaleString()}
                </Typography>
                <Typography fontSize={11} color="text.secondary">VND</Typography>
              </Box>
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
}

export default AccountList;
