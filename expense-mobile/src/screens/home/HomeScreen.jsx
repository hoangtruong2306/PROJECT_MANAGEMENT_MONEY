import React, { useEffect, useState } from "react";
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    RefreshControl, ActivityIndicator, DeviceEventEmitter
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { getUserStats } from "../../api/stats";
import { getRecentTransactions } from "../../api/transactions";
import { formatCurrency, formatDate } from "../../utils/format";
import { COLORS, SIZES, RADIUS } from "../../constants/colors";

export default function HomeScreen() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const userId = user?.id || user?.userId;

    const fetchData = async () => {
        if (!userId) return;
        try {
            const [statsRes, txRes] = await Promise.all([
                getUserStats(userId),
                getRecentTransactions(userId),
            ]);
            // Backend trả về { message: "...", data: {...} }
            const statsPayload = statsRes.data?.data || statsRes.data;
            setStats(statsPayload);

            const txPayload = txRes.data?.data || txRes.data;
            setTransactions(Array.isArray(txPayload) ? txPayload : (txPayload?.transactions || []));
        } catch (e) {
            console.warn("HomeScreen fetch error:", e?.response?.status, e?.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, [userId]);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener("refreshHome", fetchData);
        return () => sub.remove();
    }, [userId]);

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); fetchData(); }}
                    colors={[COLORS.primary]}
                />
            }
        >
            {/* Balance Card */}
            <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(stats?.balance || stats?.total_balance || 0)}</Text>
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statEmoji}>📈</Text>
                        <Text style={styles.statLabel}>Thu tháng này</Text>
                        <Text style={[styles.statValue, { color: "#4ade80" }]}>
                            {formatCurrency(stats?.monthlyIncome || stats?.total_income || 0)}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statEmoji}>📉</Text>
                        <Text style={styles.statLabel}>Chi tháng này</Text>
                        <Text style={[styles.statValue, { color: "#f87171" }]}>
                            {formatCurrency(stats?.monthlyExpense || stats?.total_expense || 0)}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Quick info row */}
            <View style={styles.quickRow}>
                <View style={styles.quickCard}>
                    <Text style={styles.quickIcon}>🎯</Text>
                    <Text style={styles.quickLabel}>Mục tiêu</Text>
                    <Text style={styles.quickValue}>{stats?.totalGoals || 0}</Text>
                </View>
                <View style={styles.quickCard}>
                    <Text style={styles.quickIcon}>📊</Text>
                    <Text style={styles.quickLabel}>Giao dịch</Text>
                    <Text style={styles.quickValue}>{stats?.totalTransactions || 0}</Text>
                </View>
                <View style={styles.quickCard}>
                    <Text style={styles.quickIcon}>💳</Text>
                    <Text style={styles.quickLabel}>Ví</Text>
                    <Text style={styles.quickValue}>{stats?.totalWallets || 0}</Text>
                </View>
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
                {transactions.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={{ fontSize: 40 }}>📭</Text>
                        <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
                        <Text style={styles.emptySub}>Nhấn ✦ để thêm giao dịch mới</Text>
                    </View>
                ) : (
                    transactions.slice(0, 8).map((tx, i) => (
                        <View key={i} style={styles.txCard}>
                            <View style={[styles.txIcon, {
                                backgroundColor: tx.type === "income" ? COLORS.incomeLight : COLORS.expenseLight
                            }]}>
                                <Text style={{ fontSize: 20 }}>{tx.category_icon || (tx.type === "income" ? "💰" : "💸")}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.txName} numberOfLines={1}>
                                    {tx.category_name || tx.description || "Giao dịch"}
                                </Text>
                                <Text style={styles.txDate}>{formatDate(tx.date || tx.transaction_date || tx.created_at)}</Text>
                            </View>
                            <Text style={[styles.txAmount, { color: tx.type === "income" ? COLORS.income : COLORS.expense }]}>
                                {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },
    balanceCard: { margin: 16, borderRadius: RADIUS.xl, padding: 24 },
    balanceLabel: { fontSize: SIZES.sm, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
    balanceAmount: { fontSize: 34, fontWeight: "800", color: "#fff", marginBottom: 20 },
    statRow: {
        flexDirection: "row", backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: RADIUS.md, padding: 12,
    },
    statItem: { flex: 1, alignItems: "center", gap: 3 },
    statEmoji: { fontSize: 18 },
    statLabel: { fontSize: 10, color: "rgba(255,255,255,0.75)" },
    statValue: { fontSize: SIZES.md, fontWeight: "700" },
    divider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
    quickRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 8 },
    quickCard: {
        flex: 1, backgroundColor: "#fff", borderRadius: RADIUS.md,
        padding: 14, alignItems: "center", gap: 4,
        shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    quickIcon: { fontSize: 22 },
    quickLabel: { fontSize: 10, color: COLORS.textMuted },
    quickValue: { fontSize: SIZES.lg, fontWeight: "800", color: COLORS.primary },
    section: { paddingHorizontal: 16, marginTop: 8 },
    sectionTitle: { fontSize: SIZES.lg, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 12 },
    emptyCard: {
        backgroundColor: "#fff", borderRadius: RADIUS.xl, padding: 32,
        alignItems: "center", gap: 8,
    },
    emptyText: { fontSize: SIZES.md, fontWeight: "600", color: COLORS.textPrimary },
    emptySub: { fontSize: SIZES.sm, color: COLORS.textMuted },
    txCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#fff", borderRadius: RADIUS.md,
        padding: 14, marginBottom: 8,
        shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    txIcon: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: "center", alignItems: "center" },
    txName: { fontSize: SIZES.md, fontWeight: "600", color: COLORS.textPrimary },
    txDate: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
    txAmount: { fontSize: SIZES.md, fontWeight: "700" },
});
