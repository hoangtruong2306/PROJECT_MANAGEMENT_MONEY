import React, { useState, useRef, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Modal, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { chatWithAI } from "../../api/ai";
import { COLORS, SIZES, RADIUS } from "../../constants/colors";

const SUGGESTIONS = [
    "Phân tích chi tiêu tháng này",
    "Tháng này tôi có tiêu lố không?",
    "Cho tôi vài gợi ý tiết kiệm"
];

export default function ChatbotModal({ visible, onClose }) {
    const [messages, setMessages] = useState([{
        id: "0",
        role: "bot",
        text: "Xin chào! Mình là Gemini, trợ lý tài chính của bạn. Hôm nay mình có thể giúp gì cho bạn? Bạn có thể hỏi mình phân tích chi tiêu hoặc xin lời khuyên!"
    }]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        if (visible) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
        }
    }, [visible, messages]);

    const handleSend = async (messageText) => {
        const textToProcess = messageText || input;
        if (!textToProcess.trim()) return;

        const newMsg = { id: Date.now().toString(), role: "user", text: textToProcess };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await chatWithAI(textToProcess);
            // Backup against nested axios response vs direct
            const reply = res.data?.reply || res.data?.data || res.reply || res.data || "Xin lỗi, mình chưa thể phân tích lúc này.";

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "bot",
                text: reply
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "bot",
                text: "Lỗi kết nối đến trợ lý AI. Vui lòng thử lại sau. (" + (error?.response?.data?.message || error.message) + ")"
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === "user";
        return (
            <View style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperBot]}>
                {!isUser && <Text style={styles.botAvatar}>🤖</Text>}
                <View style={[styles.msgBubble, isUser ? styles.msgUser : styles.msgBot]}>
                    <Text style={[styles.msgText, isUser && { color: "#fff" }]}>{item.text}</Text>
                </View>
                {isUser && <Text style={styles.userAvatar}>👤</Text>}
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.sheetContent}>
                    {/* Header */}
                    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Text style={{ fontSize: 24 }}>✨</Text>
                            <View>
                                <Text style={styles.title}>Hỏi AI Gemini</Text>
                                <Text style={styles.subtitle}>Trợ lý tài chính cá nhân</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={{ fontSize: 20, color: "#fff" }}>✕</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Chat Area */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                        style={styles.chatArea}
                    />

                    {/* Suggestions */}
                    {messages.length < 3 && (
                        <View style={{ padding: 10 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                {SUGGESTIONS.map((sug, i) => (
                                    <TouchableOpacity key={i} style={styles.sugBtn} onPress={() => handleSend(sug)} disabled={loading}>
                                        <Text style={styles.sugText}>{sug}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Input Area */}
                    <View style={styles.inputArea}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập câu hỏi tại đây..."
                            placeholderTextColor={COLORS.textMuted}
                            value={input}
                            onChangeText={setInput}
                            editable={!loading}
                            multiline
                        />
                        <TouchableOpacity onPress={() => handleSend()} disabled={loading} style={styles.sendBtn}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendIcon}>➤</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    sheetContent: { backgroundColor: COLORS.bg, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, height: "85%", overflow: "hidden" },
    header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { color: "#fff", fontSize: SIZES.lg, fontWeight: "700" },
    subtitle: { color: "rgba(255,255,255,0.8)", fontSize: SIZES.sm },
    closeBtn: { width: 32, height: 32, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, justifyContent: "center", alignItems: "center" },
    chatArea: { flex: 1, backgroundColor: COLORS.bg },
    msgWrapper: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
    msgWrapperUser: { justifyContent: "flex-end" },
    msgWrapperBot: { justifyContent: "flex-start" },
    msgBubble: { maxWidth: "75%", padding: 12, borderRadius: RADIUS.md },
    msgUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    msgBot: { backgroundColor: "#fff", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "#e2e8f0" },
    msgText: { fontSize: SIZES.md, color: COLORS.textPrimary, lineHeight: 22 },
    botAvatar: { fontSize: 24, marginRight: 8 },
    userAvatar: { fontSize: 24, marginLeft: 8 },
    sugBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "rgba(139, 92, 246, 0.1)", borderRadius: 20 },
    sugText: { color: COLORS.primary, fontSize: SIZES.sm, fontWeight: "600" },
    inputArea: { flexDirection: "row", padding: 12, gap: 10, paddingBottom: Platform.OS === "ios" ? 30 : 12, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#xf1f5f9" },
    input: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: RADIUS.lg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, maxHeight: 100, fontSize: SIZES.md, color: COLORS.textPrimary },
    sendBtn: { width: 48, height: 48, backgroundColor: COLORS.primary, borderRadius: 24, justifyContent: "center", alignItems: "center", alignSelf: "flex-end" },
    sendIcon: { color: "#fff", fontSize: 18, transform: [{ rotate: "-45deg" }], marginLeft: 4 }
});
