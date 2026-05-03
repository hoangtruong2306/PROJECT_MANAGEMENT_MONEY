import React, { useState, useEffect, useRef } from "react";
import {
    Box, IconButton, Paper, Typography, TextField,
    CircularProgress, Chip
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ReactMarkdown from "react-markdown";
import { chatWithAI } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";


const QUICK = [
    { label: "📊 Nhận xét tháng này", text: "Nhận xét chi tiêu tháng này" },
    { label: "⚠️ Tôi có tiêu lố không?", text: "Tôi có đang tiêu lố không?" },
    { label: "💡 Gợi ý tiết kiệm", text: "Cho tôi lời khuyên tiết kiệm" },
];

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([{
        role: "bot",
        content: "Xin chào! 👋 Tôi là **Trợ lý AI Tài chính** của bạn.\n\nTôi có thể phân tích chi tiêu tháng này, cảnh báo rủi ro và gợi ý tiết kiệm. Hãy hỏi tôi bất cứ điều gì!"
    }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    // Open via the speed-dial event from FloatingAction
    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener("open-ai-chat", handler);
        return () => window.removeEventListener("open-ai-chat", handler);
    }, []);

    useEffect(() => {
        if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const send = async (text) => {
        const t = text.trim();
        if (!t) return;
        setMessages(p => [...p, { role: "user", content: t }]);
        setInput("");
        setLoading(true);
        try {
            const res = await chatWithAI({ message: t });
            setMessages(p => [...p, { role: "bot", content: res.data.reply }]);
        } catch (err) {
            setMessages(p => [...p, {
                role: "bot",
                content: "😢 Xin lỗi, kết nối gặp sự cố. Vui lòng thử lại!\n\n" + (err?.response?.data?.message || "")
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>

            {/* ── Chat Window ─────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="window"
                        initial={{ opacity: 0, scale: 0.88, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 16 }}
                        transition={{ type: "spring", stiffness: 320, damping: 26 }}
                        style={{
                            position: "fixed",
                            bottom: 112,
                            right: 114,
                            zIndex: 10000,
                            transformOrigin: "bottom right",
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                width: 340,
                                height: 500,
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: "20px",
                                overflow: "hidden",
                                border: "1px solid rgba(99,102,241,0.15)",
                                boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.8) inset",
                                bgcolor: "#fafaff",
                            }}
                        >
                            {/* Header */}
                            <Box sx={{
                                background: "linear-gradient(135deg,#34d399 0%,#8b5cf6 60%,#a855f7 100%)",
                                px: 2, py: 1.5,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                flexShrink: 0,
                            }}>
                                <Box display="flex" alignItems="center" gap={1.2}>
                                    <Box sx={{
                                        width: 34, height: 34, borderRadius: "10px",
                                        bgcolor: "rgba(255,255,255,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <SmartToyRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography fontSize={13.5} fontWeight={700} color="#fff" lineHeight={1.2}>
                                            Trợ lý Tài chính AI
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ade80" }} />
                                            <Typography fontSize={10} color="rgba(255,255,255,0.75)">Gemini · Đang hoạt động</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <IconButton size="small" onClick={() => setOpen(false)}
                                    sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" } }}>
                                    <CloseRoundedIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            {/* Messages */}
                            <Box sx={{
                                flex: 1, minHeight: 0,
                                px: 1.5, py: 1.5,
                                overflowY: "auto",
                                display: "flex", flexDirection: "column", gap: 1.5,
                                bgcolor: "#f8f9ff",
                                "&::-webkit-scrollbar": { width: 4 },
                                "&::-webkit-scrollbar-thumb": { bgcolor: "#e0e7ff", borderRadius: 4 },
                            }}>
                                {messages.map((msg, i) => (
                                    <Box key={i} sx={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                                        {msg.role === "bot" && (
                                            <Box display="flex" alignItems="center" gap={0.6} mb={0.4}>
                                                <AutoAwesomeRoundedIcon sx={{ fontSize: 11, color: "#a855f7" }} />
                                                <Typography fontSize="0.68rem" color="#a855f7" fontWeight={600}>AI</Typography>
                                            </Box>
                                        )}
                                        <Paper elevation={0} sx={{
                                            px: 1.5, py: 1,
                                            borderRadius: "14px",
                                            borderTopRightRadius: msg.role === "user" ? 4 : 14,
                                            borderTopLeftRadius: msg.role === "bot" ? 4 : 14,
                                            bgcolor: msg.role === "user"
                                                ? "linear-gradient(135deg,#34d399,#a855f7)"
                                                : "#fff",
                                            background: msg.role === "user"
                                                ? "linear-gradient(135deg,#34d399,#a855f7)"
                                                : "#fff",
                                            color: msg.role === "user" ? "#fff" : "#1e293b",
                                            boxShadow: msg.role === "user"
                                                ? "0 4px 14px rgba(99,102,241,0.3)"
                                                : "0 2px 8px rgba(0,0,0,0.06)",
                                            "& p": { m: 0, fontSize: "0.83rem", lineHeight: 1.6 },
                                            "& ul,& ol": { m: 0, pl: 2, mt: 0.5 },
                                            "& li": { fontSize: "0.83rem", mb: 0.3 },
                                            "& strong": { color: msg.role === "user" ? "#e0e7ff" : "#5b21b6" },
                                        }}>
                                            {msg.role === "bot"
                                                ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                : <Typography fontSize="0.83rem">{msg.content}</Typography>
                                            }
                                        </Paper>
                                    </Box>
                                ))}
                                {loading && (
                                    <Box sx={{ alignSelf: "flex-start" }}>
                                        <Paper elevation={0} sx={{
                                            px: 1.5, py: 0.9, borderRadius: "14px", borderTopLeftRadius: 4,
                                            bgcolor: "#fff", display: "flex", gap: 1, alignItems: "center",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                        }}>
                                            <CircularProgress size={12} sx={{ color: "#a855f7" }} />
                                            <Typography fontSize="0.75rem" color="#94a3b8">Đang trả lời...</Typography>
                                        </Paper>
                                    </Box>
                                )}
                                <div ref={endRef} />
                            </Box>

                            {/* Quick Suggestions */}
                            <Box sx={{
                                px: 1.5, pt: 1, pb: 0.6,
                                bgcolor: "#fff",
                                borderTop: "1px solid #f0f0ff",
                                display: "flex", gap: 0.6,
                                overflowX: "auto",
                                flexShrink: 0,
                                "&::-webkit-scrollbar": { display: "none" },
                            }}>
                                {QUICK.map((q, i) => (
                                    <Chip
                                        key={i}
                                        label={q.label}
                                        size="small"
                                        onClick={() => send(q.text)}
                                        sx={{
                                            fontSize: "0.68rem",
                                            height: 24,
                                            bgcolor: "#f5f3ff",
                                            color: "#34d399",
                                            border: "1px solid #e0e7ff",
                                            whiteSpace: "nowrap",
                                            flexShrink: 0,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "#ede9fe", borderColor: "#c4b5fd" },
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* Input */}
                            <Box sx={{
                                px: 1.5, pt: 0.8, pb: 1.5,
                                bgcolor: "#fff",
                                display: "flex", gap: 0.8, alignItems: "center",
                                flexShrink: 0,
                            }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Nhập câu hỏi..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                                    disabled={loading}
                                    InputProps={{
                                        sx: {
                                            borderRadius: "12px",
                                            bgcolor: "#f5f3ff",
                                            fontSize: "1rem",  // ≥16px prevents browser auto-zoom
                                            "& input": { py: 0.7, fontSize: "1rem", color: "#374151" },
                                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c4b5fd" },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa", borderWidth: "1.5px" },
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={() => send(input)}
                                    disabled={!input.trim() || loading}
                                    size="small"
                                    sx={{
                                        width: 36, height: 36, flexShrink: 0,
                                        background: input.trim() ? "linear-gradient(135deg,#34d399,#a855f7)" : "#f1f5f9",
                                        color: input.trim() ? "#fff" : "#cbd5e1",
                                        boxShadow: input.trim() ? "0 4px 12px rgba(99,102,241,0.35)" : "none",
                                        transition: "all 0.2s",
                                        "&:hover": { background: "linear-gradient(135deg,#059669,#9333ea)", color: "#fff" },
                                        "&.Mui-disabled": { bgcolor: "#f1f5f9", color: "#cbd5e1" },
                                    }}
                                >
                                    <SendRoundedIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
