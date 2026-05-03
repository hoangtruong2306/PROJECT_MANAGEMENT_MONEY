import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { COLORS, SIZES, RADIUS } from "../../constants/colors";

const { height } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
        if (password !== confirm) return Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
        setLoading(true);
        try {
            await register(name, email, password);
        } catch (err) {
            Alert.alert("Đăng ký thất bại", err?.response?.data?.message || "Đã có lỗi xảy ra");
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
                    <Text style={styles.title}>Tạo tài khoản</Text>
                    <Text style={styles.subtitle}>Bắt đầu hành trình kỷ luật tài chính</Text>
                </LinearGradient>

                {/* Overlapping Card Form */}
                <View style={styles.card}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Họ và tên</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nguyễn Văn A"
                            placeholderTextColor={COLORS.textMuted}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
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

                    {/* Password */}
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
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Xác nhận mật khẩu</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.textMuted}
                                value={confirm}
                                onChangeText={setConfirm}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)} activeOpacity={0.7}>
                                <Text style={styles.eyeIcon}>{showConfirm ? "👁️" : "🫣"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={{ marginTop: 16 }}>
                        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.btn}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Đăng ký ngay</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Footer Link */}
                <View style={styles.footer}>
                    <Text style={styles.linkText}>Đã có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.link}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: COLORS.bg },
    header: { height: height * 0.40, alignItems: "center", justifyContent: "center", paddingBottom: 40 },
    logo: { width: 80, height: 80, marginBottom: 12, borderRadius: 40 },
    title: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 4 },
    subtitle: { fontSize: SIZES.sm, color: "rgba(255,255,255,0.85)" },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: -50, // Overlaps the gradient header
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

    btn: { borderRadius: RADIUS.md, paddingVertical: 16, alignItems: "center" },
    btnText: { color: "#fff", fontSize: SIZES.lg, fontWeight: "700" },

    footer: { flexDirection: "row", justifyContent: "center", marginTop: 24, paddingBottom: 30 },
    linkText: { fontSize: SIZES.md, color: COLORS.textSecondary },
    link: { color: COLORS.primary, fontWeight: "700", fontSize: SIZES.md },
});
