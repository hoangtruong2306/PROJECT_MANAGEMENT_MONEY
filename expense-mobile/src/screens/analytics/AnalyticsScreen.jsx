import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    Animated,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { getDailyStats, getCategoryStats } from "../../api/stats";
import { formatCurrency } from "../../utils/format";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");
const CHART_HEIGHT = 110;

// ─── Design Tokens ──────────────────────────────────────────────────────────
const COLORS = {
    bg: "#F5F3EE",
    headerBg: "#1A1A2E",
    white: "#FFFFFF",
    primary: "#6366F1",
    income: "#16A34A",
    incomeLight: "#DCFCE7",
    incomeBright: "#4ADE80",
    expense: "#DC2626",
    expenseLight: "#FEE2E2",
    expenseBright: "#F87171",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    border: "rgba(0,0,0,0.06)",
    track: "#F3F4F6",
    amber: "#FACC15",
    orange: "#FB923C",
    purple: "#818CF8",
    green: "#4ADE80",
};

const PIE_COLORS = [
    COLORS.expenseBright,
    COLORS.orange,
    COLORS.amber,
    COLORS.green,
    COLORS.purple,
];

const CATEGORY_LABELS = ["Ăn uống", "Di chuyển", "Mua sắm", "Giải trí", "Khác"];
const CATEGORY_PERCENTAGES = [40, 20, 14, 11, 15];
const CATEGORY_ICONS = ["🍜", "🚗", "🛒", "🎬", "📦"];

const PERIOD_TABS = ["Tuần", "Tháng", "Quý", "Năm"];

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ data, size = 120, strokeWidth = 18 }) {
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;

    const total = data.reduce((s, d) => s + d.value, 0);
    let cumulativePercent = 0;

    return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Track */}
            <Circle
                cx={cx} cy={cy} r={radius}
                fill="none"
                stroke={COLORS.track}
                strokeWidth={strokeWidth}
            />
            {data.map((item, index) => {
                const pct = item.value / total;
                const dashArray = pct * circumference;
                const dashOffset = -(cumulativePercent * circumference);
                cumulativePercent += pct;
                return (
                    <Circle
                        key={index}
                        cx={cx} cy={cy} r={radius}
                        fill="none"
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dashArray} ${circumference}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        rotation={-90}
                        origin={`${cx}, ${cy}`}
                    />
                );
            })}
            <SvgText
                x={cx} y={cy - 6}
                textAnchor="middle"
                fontSize="16"
                fontWeight="500"
                fill={COLORS.textPrimary}
            >
                {data.length}
            </SvgText>
            <SvgText
                x={cx} y={cy + 10}
                textAnchor="middle"
                fontSize="10"
                fill={COLORS.textMuted}
            >
                danh mục
            </SvgText>
        </Svg>
    );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ incomeData, expenseData }) {
    const maxVal = Math.max(...incomeData, ...expenseData, 1);
    return (
        <View style={styles.barChart}>
            {incomeData.map((inc, i) => {
                const incH = Math.max(4, (inc / maxVal) * CHART_HEIGHT);
                const expH = Math.max(4, (expenseData[i] / maxVal) * CHART_HEIGHT);
                const label = String(i * 2 + 1);
                return (
                    <View key={i} style={styles.barGroup}>
                        <View style={styles.barPair}>
                            <View style={[styles.bar, styles.barIncome, { height: incH }]} />
                            <View style={[styles.bar, styles.barExpense, { height: expH }]} />
                        </View>
                        <Text style={styles.barLabel}>{label}</Text>
                    </View>
                );
            })}
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
    const { user } = useAuth();
    const userId = user?.id || user?.userId;

    const [loading, setLoading] = useState(true);
    const [activePeriod, setActivePeriod] = useState(1);
    const [trendData, setTrendData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (!userId) return;
        const fetchStats = async () => {
            try {
                const [trendRes, catRes] = await Promise.all([
                    getDailyStats(userId),
                    getCategoryStats(userId),
                ]);
                const tData = trendRes.data?.data || trendRes.data || [];
                const cData = catRes.data?.data || catRes.data || [];
                setTrendData(Array.isArray(tData) ? tData : []);
                setCategoryData(Array.isArray(cData) ? cData : []);
            } catch (e) {
                console.warn("Analytics fetch error:", e?.message);
            } finally {
                setLoading(false);
                Animated.parallel([
                    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                    Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
                ]).start();
            }
        };
        fetchStats();
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // ── Trend Data ──
    const incomeVals = trendData.length
        ? trendData.map(d => parseFloat(d.total_income || 0))
        : [0, 0, 0, 32500000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const expenseVals = trendData.length
        ? trendData.map(d => parseFloat(d.total_expense || 0))
        : [45000, 120000, 80000, 200000, 65000, 180000, 95000, 285000, 50000, 140000, 35000, 90000, 160000, 45000, 70000];

    const totalIncome = incomeVals.reduce((s, v) => s + v, 0);
    const totalExpense = expenseVals.reduce((s, v) => s + v, 0);
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // ── Category / Pie Data ──
    const expCats = categoryData;
    const pieData = expCats.length
        ? expCats.map((item, i) => ({
            value: parseFloat(item.total || item.total_amount || item.total_expense || 0),
            color: item.color || PIE_COLORS[i % PIE_COLORS.length],
            name: item.category_name || item.name || "Khác",
        })).filter(d => d.value > 0)
        : CATEGORY_LABELS.map((name, i) => ({
            value: CATEGORY_PERCENTAGES[i],
            color: PIE_COLORS[i],
            name,
        }));

    const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

    return (
        <View style={styles.root}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Header ───────────────────────────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.headerDecor1} />
                    <View style={styles.headerDecor2} />

                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerLabel}>Tháng 3, 2026</Text>
                            <Text style={styles.headerTitle}>Biểu đồ chi tiêu</Text>
                        </View>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(user?.name || "HT").substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    {/* Period Tabs */}
                    <View style={styles.periodTabs}>
                        {PERIOD_TABS.map((tab, i) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.periodTab, activePeriod === i && styles.periodTabActive]}
                                onPress={() => setActivePeriod(i)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.periodTabText, activePeriod === i && styles.periodTabTextActive]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* ─── Summary Cards ───────────────────────────────────── */}
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <View style={[styles.summaryIcon, { backgroundColor: COLORS.incomeLight }]}>
                                <Text>↑</Text>
                            </View>
                            <Text style={styles.summaryLabel}>THU NHẬP</Text>
                            <Text style={[styles.summaryAmount, { color: COLORS.income }]}>
                                {formatCurrency(totalIncome)}
                            </Text>
                            <Text style={styles.summaryChange}>+8% so tháng trước</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <View style={[styles.summaryIcon, { backgroundColor: COLORS.expenseLight }]}>
                                <Text>↓</Text>
                            </View>
                            <Text style={styles.summaryLabel}>CHI TIÊU</Text>
                            <Text style={[styles.summaryAmount, { color: COLORS.expense }]}>
                                {formatCurrency(totalExpense)}
                            </Text>
                            <Text style={styles.summaryChange}>-3% so tháng trước</Text>
                        </View>
                    </View>

                    {/* ─── Bar Chart ───────────────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Thu & Chi 30 ngày</Text>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.barLegend}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: COLORS.incomeBright }]} />
                                    <Text style={styles.legendText}>Thu nhập</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: COLORS.expenseBright }]} />
                                    <Text style={styles.legendText}>Chi tiêu</Text>
                                </View>
                            </View>

                            <BarChart incomeData={incomeVals} expenseData={expenseVals} />

                            {/* Savings Rate */}
                            <View style={styles.netWrap}>
                                <Text style={styles.netLabel}>Tỉ lệ tiết kiệm tháng này</Text>
                                <View style={styles.netTrack}>
                                    <View style={[styles.netFill, { width: `${Math.min(savingsRate, 100)}%` }]} />
                                </View>
                                <View style={styles.netStats}>
                                    <Text style={styles.netStat}>
                                        Đã dùng <Text style={styles.netStatVal}>{formatCurrency(totalExpense)}</Text>
                                    </Text>
                                    <Text style={styles.netStat}>
                                        Tiết kiệm{" "}
                                        <Text style={[styles.netStatVal, { color: COLORS.primary }]}>
                                            {savingsRate}%
                                        </Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ─── Donut Chart ─────────────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Cơ cấu chi tiêu</Text>
                            <TouchableOpacity>
                                <Text style={styles.sectionLink}>Xem tất cả</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.card}>
                            {pieData.length === 0 ? (
                                <Text style={styles.emptyText}>Chưa có dữ liệu chi tiêu</Text>
                            ) : (
                                <View style={styles.donutWrap}>
                                    <DonutChart data={pieData} size={130} strokeWidth={20} />
                                    <View style={styles.donutLegend}>
                                        {pieData.map((item, i) => (
                                            <View key={i} style={styles.donutItem}>
                                                <View style={styles.donutItemLeft}>
                                                    <View style={[styles.donutBar, { backgroundColor: item.color }]} />
                                                    <Text style={styles.donutName} numberOfLines={1}>{item.name}</Text>
                                                </View>
                                                <Text style={styles.donutPct}>
                                                    {Math.round((item.value / pieTotal) * 100)}%
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* ─── Savings Goal ────────────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Mục tiêu tiết kiệm</Text>
                        </View>
                        <View style={styles.goalCard}>
                            <Text style={styles.goalLabel}>Đang theo dõi</Text>
                            <Text style={styles.goalName}>Mua xe máy mới</Text>
                            <View style={styles.goalTrack}>
                                <View style={[styles.goalFill, { width: "67%" }]} />
                            </View>
                            <View style={styles.goalStats}>
                                <Text style={styles.goalStat}>
                                    Đã có <Text style={styles.goalStatVal}>33.5tr</Text>
                                </Text>
                                <Text style={styles.goalStat}>
                                    Mục tiêu <Text style={styles.goalStatVal}>50tr</Text>
                                </Text>
                                <Text style={[styles.goalStat, { color: COLORS.primary, fontWeight: "600" }]}>
                                    67%
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* ─── Recent Transactions ─────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
                            <TouchableOpacity>
                                <Text style={styles.sectionLink}>Tất cả</Text>
                            </TouchableOpacity>
                        </View>
                        {RECENT_TRANSACTIONS.map((txn, i) => (
                            <TouchableOpacity key={i} style={styles.txnItem} activeOpacity={0.75}>
                                <View style={[styles.txnIcon, { backgroundColor: txn.iconBg }]}>
                                    <Text style={styles.txnEmoji}>{txn.emoji}</Text>
                                </View>
                                <View style={styles.txnMeta}>
                                    <Text style={styles.txnName}>{txn.name}</Text>
                                    <Text style={styles.txnCat}>{txn.category} · {txn.date}</Text>
                                </View>
                                <Text style={[styles.txnAmount, { color: txn.amount < 0 ? COLORS.expense : COLORS.income }]}>
                                    {txn.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(txn.amount))}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>

            {/* ─── Bottom Nav ──────────────────────────────────────────── */}
            <View style={styles.bottomNav}>
                {NAV_ITEMS.map((item, i) => {
                    const isActive = i === 1;
                    const isAdd = i === 2;
                    return (
                        <TouchableOpacity key={i} style={styles.navItem} activeOpacity={0.7}>
                            {isAdd ? (
                                <View style={styles.navAddBtn}>
                                    <Text style={styles.navAddIcon}>+</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.navEmoji}>{item.icon}</Text>
                                    {isActive && <View style={styles.navDot} />}
                                </>
                            )}
                            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const RECENT_TRANSACTIONS = [
    { name: "Bún bò Huế", category: "Ăn uống", date: "Hôm nay", amount: -45000, emoji: "🍜", iconBg: "#FEE2E2" },
    { name: "Lương tháng 3", category: "Thu nhập", date: "01/03", amount: 32500000, emoji: "💰", iconBg: "#DCFCE7" },
    { name: "Siêu thị Coopmart", category: "Mua sắm", date: "13/03", amount: -285000, emoji: "🛒", iconBg: "#FEF3C7" },
    { name: "Grab xe máy", category: "Di chuyển", date: "12/03", amount: -35000, emoji: "🚗", iconBg: "#EDE9FE" },
];

const NAV_ITEMS = [
    { icon: "🏠", label: "Tổng quan" },
    { icon: "📊", label: "Biểu đồ" },
    { icon: "+", label: "Thêm" },
    { icon: "📋", label: "Lịch sử" },
    { icon: "⚙️", label: "Cài đặt" },
];

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },

    // Header
    header: {
        backgroundColor: COLORS.headerBg,
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 32,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: "hidden",
    },
    headerDecor1: {
        position: "absolute", width: 180, height: 180, borderRadius: 90,
        backgroundColor: "rgba(255,255,255,0.04)", top: -60, right: -40,
    },
    headerDecor2: {
        position: "absolute", width: 120, height: 120, borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.03)", bottom: -30, left: 20,
    },
    headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    headerLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase" },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: 4 },
    avatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: "center", alignItems: "center",
    },
    avatarText: { fontSize: 14, fontWeight: "600", color: "#fff" },

    // Period Tabs
    periodTabs: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 10, padding: 3, gap: 2,
    },
    periodTab: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: "center" },
    periodTabActive: { backgroundColor: "#fff" },
    periodTabText: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: "600" },
    periodTabTextActive: { color: COLORS.headerBg },

    // Summary
    summaryRow: {
        flexDirection: "row", gap: 12,
        paddingHorizontal: 16, marginTop: -12,
        zIndex: 2,
    },
    summaryCard: {
        flex: 1, backgroundColor: COLORS.white,
        borderRadius: 16, padding: 14,
        borderWidth: 0.5, borderColor: COLORS.border,
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    summaryIcon: {
        width: 32, height: 32, borderRadius: 10,
        justifyContent: "center", alignItems: "center", marginBottom: 10,
    },
    summaryLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "600", letterSpacing: 0.5 },
    summaryAmount: { fontSize: 17, fontWeight: "700", marginTop: 3 },
    summaryChange: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

    // Section
    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    sectionTitle: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary },
    sectionLink: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },

    // Card
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 20, padding: 18,
        borderWidth: 0.5, borderColor: COLORS.border,
        shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },

    // Bar Chart
    barLegend: { flexDirection: "row", gap: 16, marginBottom: 14 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "500" },
    barChart: { flexDirection: "row", alignItems: "flex-end", height: CHART_HEIGHT, gap: 4 },
    barGroup: { flex: 1, alignItems: "center" },
    barPair: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
    bar: { width: 8, borderRadius: 4 },
    barIncome: { backgroundColor: COLORS.incomeBright },
    barExpense: { backgroundColor: COLORS.expenseBright },
    barLabel: { fontSize: 8, color: COLORS.textMuted, marginTop: 4 },

    // Net / Savings Rate
    netWrap: { marginTop: 18, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: COLORS.border },
    netLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
    netTrack: { height: 6, backgroundColor: COLORS.track, borderRadius: 999, overflow: "hidden" },
    netFill: { height: "100%", borderRadius: 999, backgroundColor: COLORS.primary },
    netStats: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
    netStat: { fontSize: 12, color: COLORS.textMuted },
    netStatVal: { fontWeight: "600", color: COLORS.textPrimary },

    // Donut
    donutWrap: { flexDirection: "row", alignItems: "center", gap: 16 },
    donutLegend: { flex: 1 },
    donutItem: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", paddingVertical: 7,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(0,0,0,0.05)",
    },
    donutItemLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
    donutBar: { width: 3, height: 26, borderRadius: 999 },
    donutName: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
    donutPct: { fontSize: 12, fontWeight: "700", color: COLORS.textPrimary },
    emptyText: { textAlign: "center", color: COLORS.textMuted, fontStyle: "italic", paddingVertical: 20 },

    // Goal Card
    goalCard: {
        backgroundColor: COLORS.headerBg,
        borderRadius: 20, padding: 18,
        shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
    },
    goalLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 },
    goalName: { fontSize: 16, fontWeight: "600", color: "#fff" },
    goalTrack: {
        height: 6, backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 999, marginVertical: 14, overflow: "hidden",
    },
    goalFill: { height: "100%", borderRadius: 999, backgroundColor: COLORS.primary },
    goalStats: { flexDirection: "row", justifyContent: "space-between" },
    goalStat: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
    goalStatVal: { color: "#fff", fontWeight: "600" },

    // Transactions
    txnItem: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: COLORS.white, borderRadius: 14,
        padding: 13, marginBottom: 10,
        borderWidth: 0.5, borderColor: COLORS.border,
        shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
    },
    txnIcon: { width: 42, height: 42, borderRadius: 13, justifyContent: "center", alignItems: "center" },
    txnEmoji: { fontSize: 20 },
    txnMeta: { flex: 1 },
    txnName: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
    txnCat: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    txnAmount: { fontSize: 14, fontWeight: "700" },

    // Bottom Nav
    bottomNav: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.white,
        flexDirection: "row",
        paddingTop: 10, paddingBottom: 24,
        borderTopWidth: 0.5, borderTopColor: COLORS.border,
        shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 12, elevation: 10,
    },
    navItem: { flex: 1, alignItems: "center", gap: 3 },
    navEmoji: { fontSize: 22 },
    navDot: { width: 20, height: 3, borderRadius: 999, backgroundColor: COLORS.primary },
    navLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "500" },
    navLabelActive: { color: COLORS.primary },
    navAddBtn: {
        width: 48, height: 48,
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        justifyContent: "center", alignItems: "center",
        marginTop: -12,
        shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
    },
    navAddIcon: { fontSize: 26, color: "#fff", lineHeight: 30 },
});