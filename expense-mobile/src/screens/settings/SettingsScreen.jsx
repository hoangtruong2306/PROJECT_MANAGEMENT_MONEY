import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { COLORS, SIZES, RADIUS } from "../../constants/colors";

export default function SettingsScreen() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
            { text: "Huỷ", style: "cancel" },
            { text: "Đăng xuất", style: "destructive", onPress: logout },
        ]);
    };

    const menuItems = [
        { icon: "👤", label: "Thông tin cá nhân" },
        { icon: "🔒", label: "Đổi mật khẩu" },
        { icon: "🏷️", label: "Quản lý danh mục" },
        { icon: "💳", label: "Quản lý ví / tài khoản" },
        { icon: "🌙", label: "Chế độ tối" },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Profile header */}
            <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={{ fontSize: 32 }}>👤</Text>
                </View>
                <Text style={styles.name}>{user?.name || "Người dùng"}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.role === "admin" ? "Quản trị viên" : "Thành viên"}</Text>
                </View>
            </LinearGradient>

            {/* Menu */}
            <View style={styles.menu}>
                {menuItems.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.85}>
                <Text style={styles.logoutText}>🚪 Đăng xuất</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { paddingTop: 60, paddingBottom: 30, alignItems: "center", gap: 6 },
    avatar: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center",
        marginBottom: 8,
    },
    name: { fontSize: SIZES.xl, fontWeight: "800", color: "#fff" },
    email: { fontSize: SIZES.sm, color: "rgba(255,255,255,0.8)" },
    roleBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
    roleText: { fontSize: SIZES.xs, color: "#fff", fontWeight: "600" },
    menu: { margin: 16, backgroundColor: "#fff", borderRadius: RADIUS.xl, overflow: "hidden" },
    menuItem: {
        flexDirection: "row", alignItems: "center", gap: 14,
        paddingHorizontal: 18, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    },
    menuIcon: { fontSize: 20 },
    menuLabel: { flex: 1, fontSize: SIZES.md, color: COLORS.textPrimary },
    menuArrow: { fontSize: 20, color: COLORS.textMuted },
    logoutBtn: {
        margin: 16, borderRadius: RADIUS.md,
        borderWidth: 1.5, borderColor: "#fca5a5",
        backgroundColor: "#fff7f7", padding: 15, alignItems: "center",
    },
    logoutText: { color: "#ef4444", fontSize: SIZES.md, fontWeight: "700" },
});
