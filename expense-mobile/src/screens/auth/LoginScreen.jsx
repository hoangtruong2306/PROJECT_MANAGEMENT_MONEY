import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { COLORS, SIZES, RADIUS } from "../../constants/colors";

const { height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            Alert.alert("Đăng nhập thất bại", err?.response?.data?.message || "Sai email hoặc mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" bounces={false}>
                {/* Header Gradient */}
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
                    <Image source={require("../../../assets/expense_app_logo.png")} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Đăng nhập để quản lý tài chính</Text>
                </LinearGradient>

                {/* Overlapping Card Form */}
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email truy cập</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="example@email.com"
                            placeholderTextColor={COLORS.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mật khẩu</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                                <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "🫣"}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={{ alignSelf: "flex-end", paddingVertical: 8 }} onPress={() => navigation.navigate("ForgotPassword")}>
                            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
                        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.btn}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Đăng nhập</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Footer Link */}
                <View style={styles.footer}>
                    <Text style={styles.linkText}>Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.link}>Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: COLORS.bg },
    header: { height: height * 0.45, alignItems: "center", justifyContent: "center", paddingBottom: 40 },
    logo: { width: 90, height: 90, marginBottom: 16, borderRadius: 45 },
    title: { fontSize: 32, fontWeight: "800", color: "#fff", marginBottom: 4 },
    subtitle: { fontSize: SIZES.md, color: "rgba(255,255,255,0.85)" },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: -60, // Overlaps the gradient header
        borderRadius: RADIUS.xl,
        padding: 24,
        shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
        gap: 16
    },
    inputGroup: { flex: 1 },
    label: { fontSize: SIZES.sm, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: "#f8fafc", borderRadius: RADIUS.md,
        paddingHorizontal: 16, paddingVertical: 14,
        fontSize: SIZES.md, color: COLORS.textPrimary,
    },
    passwordContainer: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#f8fafc", borderRadius: RADIUS.md,
    },
    passwordInput: {
        flex: 1, paddingHorizontal: 16, paddingVertical: 14,
        fontSize: SIZES.md, color: COLORS.textPrimary,
    },
    eyeBtn: { padding: 14 },
    eyeIcon: { fontSize: 18 },

    forgotText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: "600" },
    btn: { borderRadius: RADIUS.md, paddingVertical: 16, alignItems: "center" },
    btnText: { color: "#fff", fontSize: SIZES.lg, fontWeight: "700" },

    footer: { flexDirection: "row", justifyContent: "center", marginTop: 30, paddingBottom: 30 },
    linkText: { fontSize: SIZES.md, color: COLORS.textSecondary },
    link: { color: COLORS.primary, fontWeight: "700", fontSize: SIZES.md },
});
