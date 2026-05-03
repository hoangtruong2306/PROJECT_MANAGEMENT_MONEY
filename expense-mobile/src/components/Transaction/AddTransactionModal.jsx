import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Modal, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { getCategories } from "../../api/categories";
import { getUserWallets } from "../../api/wallets";
import { createTransaction } from "../../api/transactions";
import { COLORS, SIZES, RADIUS } from "../../constants/colors";

export default function AddTransactionModal({ visible, onClose, onSuccess }) {
    const { user } = useAuth();
    const userId = user?.id || user?.userId;

    const [type, setType] = useState("expense");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [walletId, setWalletId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (visible && userId) {
            loadData();
        }
    }, [visible, userId, type]);

    const loadData = async () => {
        setFetching(true);
        try {
            const [catRes, walRes] = await Promise.all([
                getCategories(),
                getUserWallets(userId)
            ]);
            const catsMap = catRes.data?.data || catRes.data || [];
            const walsMap = walRes.data?.data || walRes.data || [];

            // Filter categories based on transaction type
            const filteredCats = catsMap.filter(c => c.type === type);
            setCategories(filteredCats);
            setWallets(walsMap);

            if (filteredCats.length > 0 && !filteredCats.find(c => c.id === categoryId)) {
                setCategoryId(filteredCats[0].id);
            }
            if (walsMap.length > 0 && !walletId) {
                setWalletId(walsMap[0].id);
            }
        } catch (e) {
            console.warn("Failed to fetch form data", e);
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        if (!amount || isNaN(amount) || amount <= 0) return Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
        if (!categoryId) return Alert.alert("Lỗi", "Vui lòng chọn danh mục");
        if (!walletId) return Alert.alert("Lỗi", "Vui lòng chọn ví");

        setLoading(true);
        try {
            await createTransaction({
                user_id: userId,
                category_id: categoryId,
                wallet_id: walletId,
                type,
                amount: parseFloat(amount),
                description,
                date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
            });
            setAmount("");
            setDescription("");
            onSuccess?.();
            onClose();
        } catch (err) {
            Alert.alert("Lỗi", err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Render Horizontal List for badging selection (Categories & Wallets)
    const renderSelectionList = (items, selectedId, onSelect, getKeyField = "name", getIconField = "icon") => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {items.map(item => {
                const isSelected = item.id === selectedId;
                return (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        onPress={() => onSelect(item.id)}
                        style={[
                            styles.badgeBtn,
                            isSelected && { backgroundColor: type === "income" ? COLORS.incomeLight : COLORS.expenseLight, borderColor: type === "income" ? COLORS.income : COLORS.expense }
                        ]}
                    >
                        <Text style={{ fontSize: 16, marginRight: 4 }}>{item[getIconField] || "📌"}</Text>
                        <Text style={[styles.badgeText, isSelected && { color: type === "income" ? COLORS.income : COLORS.expense, fontWeight: "700" }]}>
                            {item[getKeyField]}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={styles.overlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />

                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Thêm giao dịch mới</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={{ fontSize: 20, color: COLORS.textMuted }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Type toggles */}
                        <View style={styles.toggleRow}>
                            <TouchableOpacity
                                onPress={() => setType("expense")}
                                style={[styles.toggleBtn, type === "expense" && styles.toggleActiveExpense]}
                            >
                                <Text style={[styles.toggleText, type === "expense" && { color: "#fff" }]}>Khoản Chi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setType("income")}
                                style={[styles.toggleBtn, type === "income" && styles.toggleActiveIncome]}
                            >
                                <Text style={[styles.toggleText, type === "income" && { color: "#fff" }]}>Khoản Thu</Text>
                            </TouchableOpacity>
                        </View>

                        {fetching ? (
                            <ActivityIndicator style={{ padding: 40 }} color={COLORS.primary} />
                        ) : (
                            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>

                                {/* Amount */}
                                <Text style={styles.label}>Số tiền (đ)</Text>
                                <TextInput
                                    style={[styles.input, { fontSize: 24, fontWeight: "700", color: type === "income" ? COLORS.income : COLORS.expense }]}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    autoFocus
                                />

                                {/* Wallets */}
                                <Text style={styles.label}>Từ ví / Tài khoản</Text>
                                {wallets.length === 0 ? <Text style={styles.errorText}>Bạn chưa có ví nào!</Text> : renderSelectionList(wallets, walletId, setWalletId)}

                                {/* Categories */}
                                <Text style={styles.label}>Danh mục</Text>
                                {categories.length === 0 ? <Text style={styles.errorText}>Không có danh mục phù hợp</Text> : renderSelectionList(categories, categoryId, setCategoryId)}

                                {/* Description */}
                                <Text style={styles.label}>Ghi chú (Tùy chọn)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mua sắm, ăn uống, nhận lương..."
                                    placeholderTextColor={COLORS.textMuted}
                                    value={description}
                                    onChangeText={setDescription}
                                />

                                {/* Save Btn */}
                                <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.85} style={{ marginTop: 10 }}>
                                    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.saveBtn}>
                                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu Giao Dịch</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>

                            </ScrollView>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end"
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
        padding: 20, paddingBottom: Platform.OS === "ios" ? 40 : 20,
        maxHeight: "90%",
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    title: { fontSize: SIZES.xl, fontWeight: "800", color: COLORS.textPrimary },
    closeBtn: { width: 32, height: 32, backgroundColor: COLORS.bg, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    toggleRow: { flexDirection: "row", gap: 10, marginBottom: 20, backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: RADIUS.sm },
    toggleActiveExpense: { backgroundColor: COLORS.expense, shadowColor: COLORS.expense, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
    toggleActiveIncome: { backgroundColor: COLORS.income, shadowColor: COLORS.income, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
    toggleText: { fontSize: SIZES.md, fontWeight: "600", color: COLORS.textSecondary },
    form: { paddingBottom: 20 },
    label: { fontSize: SIZES.sm, fontWeight: "700", color: COLORS.textSecondary, marginTop: 16, marginBottom: 8 },
    input: {
        backgroundColor: COLORS.bg, borderRadius: RADIUS.md,
        paddingHorizontal: 16, paddingVertical: 14,
        fontSize: SIZES.md, color: COLORS.textPrimary,
    },
    badgeBtn: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: COLORS.bg, borderWidth: 1, borderColor: "transparent",
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    },
    badgeText: { fontSize: SIZES.sm, color: COLORS.textPrimary, fontWeight: "500" },
    errorText: { color: COLORS.expense, fontSize: SIZES.sm, fontStyle: "italic" },
    saveBtn: { borderRadius: RADIUS.md, paddingVertical: 16, alignItems: "center", marginTop: 24 },
    saveBtnText: { color: "#fff", fontSize: SIZES.lg, fontWeight: "700" },
});
