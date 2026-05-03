import { Box, Fab, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  AddTransactionDialog,
  AddWalletDialog,
  AddGoalDialog,
  AddBudgetDialog,
} from "./QuickActionDialogs";

const ACTION_ICONS = {
  transaction: "💸",
  wallet: "🏦",
  goal: "🎯",
  budget: "📊",
  ai: "✨",          // AI action icon
};

// AI action is always available on every page
const AI_ACTION = { label: "Hỏi AI Gemini", key: "ai" };

function FloatingAction({ active }) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(null);

  const actionsMap = {
    dashboard: [
      { label: "Thêm giao dịch", key: "transaction" },
    ],
    analytics: [],
    finance: [
      { label: "Thêm giao dịch", key: "transaction" },
      { label: "Thêm tài khoản", key: "wallet" },
      { label: "Tạo mục tiêu tiết kiệm", key: "goal" },
      { label: "Chỉnh ngân sách", key: "budget" },
    ],
    settings: [],
  };

  // Append AI action to every page's list
  const pageActions = actionsMap[active] || [];
  const actions = [...pageActions, AI_ACTION];

  const openDialog = (key) => {
    setOpen(false);
    if (key === "ai") {
      // Notify the Chatbot component to open its window
      window.dispatchEvent(new CustomEvent("open-ai-chat"));
    } else {
      setDialog(key);
    }
  };

  const handleSuccess = () => {
    window.dispatchEvent(new CustomEvent("fab-action-success", { detail: dialog }));
  };

  return (
    <>
      <Box sx={{ position: "fixed", bottom: 40, right: 50, zIndex: 2000 }}>
        {/* Overlay to close on click-outside */}
        {open && (
          <Box
            onClick={() => setOpen(false)}
            sx={{
              position: "fixed", inset: 0, zIndex: -1,
              bgcolor: "rgba(0,0,0,0.08)",
            }}
          />
        )}

        {/* Action List */}
        <Box sx={{
          position: "absolute", bottom: 75, right: 0,
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1,
        }}>
          <AnimatePresence>
            {open && actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.9 }}
                transition={{ duration: 0.22, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
              >
                <Box
                  onClick={() => openDialog(action.key)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    px: 2.5, py: 1.2,
                    bgcolor: action.key === "ai" ? "#faf5ff" : "#ffffff",
                    borderRadius: 4,
                    border: action.key === "ai" ? "1px solid #e9d5ff" : "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: action.key === "ai" ? "#f5f3ff" : "#f5f3ff",
                      transform: "translateX(-4px)",
                      boxShadow: "0 14px 35px rgba(99,102,241,0.15)",
                    },
                  }}
                >
                  <Typography fontSize={16}>{ACTION_ICONS[action.key]}</Typography>
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    color={action.key === "ai" ? "#7c3aed" : "#374151"}
                  >
                    {action.label}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>

        {/* Main FAB */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Fab
            onClick={() => setOpen(!open)}
            sx={{
              background: "linear-gradient(135deg, #34d399, #8b5cf6)",
              color: "#fff",
              boxShadow: open
                ? "0 15px 40px rgba(99,102,241,0.55)"
                : "0 10px 28px rgba(99,102,241,0.38)",
              transition: "box-shadow 0.3s, background 0.3s",
              "&:hover": {
                background: "linear-gradient(135deg, #059669, #7c3aed)",
              },
            }}
          >
            <motion.div
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.25, ease: "backOut" }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <AddIcon sx={{ fontSize: 26 }} />
            </motion.div>
          </Fab>
        </motion.div>
      </Box>

      {/* Dialogs */}
      <AddTransactionDialog
        open={dialog === "transaction"}
        onClose={() => setDialog(null)}
        onSuccess={handleSuccess}
      />
      <AddWalletDialog
        open={dialog === "wallet"}
        onClose={() => setDialog(null)}
        onSuccess={handleSuccess}
      />
      <AddGoalDialog
        open={dialog === "goal"}
        onClose={() => setDialog(null)}
        onSuccess={handleSuccess}
      />
      <AddBudgetDialog
        open={dialog === "budget"}
        onClose={() => setDialog(null)}
        onSuccess={handleSuccess}
      />
    </>
  );
}

export default FloatingAction;
