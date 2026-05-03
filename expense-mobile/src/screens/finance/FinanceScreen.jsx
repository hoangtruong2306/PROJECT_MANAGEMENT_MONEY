import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { getUserGoals } from "../../api/goals";
import { getUserBudgets } from "../../api/budgets";
import { COLORS, SIZES, RADIUS } from "../../constants/colors";
import { formatCurrency } from "../../utils/format";

export default function FinanceScreen() {
    const { user } = useAuth();
    const userId = user?.id || user?.userId;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [goals, setGoals] = useState([]);
    const [budgets, setBudgets] = useState([]);

    const fetchData = async () => {
        if (!userId) return;
        try {
            const [goalsRes, budgetsRes] = await Promise.all([
                getUserGoals(userId),
                getUserBudgets(userId)
            ]);

            const gData = goalsRes.data?.data || goalsRes.data || [];
            const bData = budgetsRes.data?.data || budgetsRes.data || [];

            setGoals(Array.isArray(gData) ? gData : []);
            setBudgets(Array.isArray(bData) ? bData : []);
        } catch (error) {
            console.warn("Finance screen fetch error:", error?.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData() }, [userId]);

    const renderProgressBar = (current, target, color) => {
        const percent = Math.min((current / (target || 1)) * 100, 100);
        return (
            <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
            </View>
        );
    };

    if (loading) return (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tài chính</Text>
                <Text style={styles.headerSub}>Mục tiêu & Hạn mức chi tiêu</Text>
            </View>

            {/* Mục Tiêu */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🎯 Mục Tiêu Tiết Kiệm</Text>
                </View>
                {goals.length === 0 ? (
                    <Text style={styles.emptyText}>Chưa có mục tiêu nào</Text>
                ) : (
                    goals.map(goal => (
                        <View key={goal.id} style={styles.card}>
                            <Text style={styles.cardTitle}>{goal.name}</Text>
                            <View style={styles.rowBetween}>
                                <Text style={styles.cardVal}>{formatCurrency(goal.current_amount)}</Text>
                                <Text style={styles.cardTarget}>/ {formatCurrency(goal.target_amount)}</Text>
                            </View>
                            {renderProgressBar(goal.current_amount, goal.target_amount, COLORS.income)}
                            {goal.deadline && <Text style={styles.deadline}>Deadline: {new Date(goal.deadline).toLocaleDateString("vi-VN")}</Text>}
                        </View>
                    ))
                )}
            </View>

            {/* Hạn Mức */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>💸 Hạn Mức Tháng</Text>
                </View>
                {budgets.length === 0 ? (
                    <Text style={styles.emptyText}>Chưa có hạn mức nào</Text>
                ) : (
                    budgets.map(budget => {
                        const isOver = budget.spent_amount > budget.amount;
                        return (
                            <View key={budget.id} style={styles.card}>
                                <Text style={styles.cardTitle}>{budget.category_name || "Danh mục"}</Text>
                                <View style={styles.rowBetween}>
                                    <Text style={[styles.cardVal, isOver && { color: COLORS.expense }]}>
                                        {formatCurrency(budget.spent_amount || 0)}
                                    </Text>
                                    <Text style={styles.cardTarget}>/ {formatCurrency(budget.amount)}</Text>
                                </View>
                                {renderProgressBar(budget.spent_amount || 0, budget.amount, isOver ? COLORS.expense : COLORS.primary)}
                                {isOver && <Text style={styles.errorText}>Đã vượt quá hạn mức!</Text>}
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },
    header: { padding: 20, paddingTop: 10 },
    headerTitle: { fontSize: 28, fontWeight: "800", color: COLORS.textPrimary },
    headerSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: SIZES.lg, fontWeight: "700", color: COLORS.textPrimary },
    emptyText: { textAlign: "center", color: COLORS.textMuted, fontStyle: "italic", marginTop: 10 },
    card: {
        backgroundColor: "#fff", padding: 16, borderRadius: RADIUS.md, marginBottom: 12,
        shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    cardTitle: { fontSize: SIZES.md, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 8 },
    rowBetween: { flexDirection: "row", alignItems: "baseline", marginBottom: 8 },
    cardVal: { fontSize: SIZES.lg, fontWeight: "700", color: COLORS.textPrimary },
    cardTarget: { fontSize: SIZES.sm, color: COLORS.textMuted, marginLeft: 4 },
    progressBg: { height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 4 },
    deadline: { fontSize: 12, color: COLORS.textMuted, marginTop: 10 },
    errorText: { fontSize: 12, color: COLORS.expense, marginTop: 8, fontWeight: "600" }
});
