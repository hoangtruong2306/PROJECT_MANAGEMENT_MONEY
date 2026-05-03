import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, RADIUS } from "../../constants/colors";
import client from "../../api/client";

const { height } = Dimensions.get("window");

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleReset = async () => {
        if (!email) return Alert.alert("Lỗi", "Vui lòng nhập định dạng email hợp lệ");
        setLoading(true);
        try {
            await client.post("/auth/forgot-password", { email });
            setSuccess(true);
        } catch (err) {
            Alert.alert("Lỗi", err?.response?.data?.message || "Không thể gửi yêu cầu đặt lại mật khẩu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" bounces={false}>
                {/* Header Gradient */}
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backTxt}>← Quay lại</Text>
                    </TouchableOpacity>
                    <Image source={require("../../../assets/expense_app_logo.png")} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.title}>Quên mật khẩu?</Text>
                    <Text style={styles.subtitle}>Đừng lo, hãy nhập email để khôi phục</Text>
                </LinearGradient>

                {/* Overlapping Card Form */}
                <View style={styles.card}>
                    {success ? (
                        <View style={styles.successBox}>
                            <Text style={styles.successIcon}>✅</Text>
                            <Text style={styles.successTitle}>Đã gửi hướng dẫn!</Text>
                            <Text style={styles.successDesc}>
                                Chúng tôi đã gửi một liên kết khôi phục tới {email}. Vui lòng kiểm tra hộp thư đến của bạn để tiếp tục.
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 24 }}>
                                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.btn}>
                                    <Text style={styles.btnText}>Quay về đăng nhập</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.desc}>
                                    Nhập địa chỉ email liên kết với tài khoản của bạn. Chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu của bạn.
                                </Text>
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

                            <TouchableOpacity onPress={handleReset} disabled={loading} activeOpacity={0.85} style={{ marginTop: 16 }}>
                                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.btn}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Gửi yêu cầu</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: COLORS.bg },
    header: { height: height * 0.45, alignItems: "center", justifyContent: "center", paddingBottom: 40, paddingTop: 20 },
    backBtn: { position: "absolute", top: 60, left: 20 },
    backTxt: { color: "#fff", fontSize: SIZES.md, fontWeight: "600" },
    logo: { width: 80, height: 80, marginBottom: 16, borderRadius: 40 },
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
    desc: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 22 },
    inputGroup: { flex: 1 },
    label: { fontSize: SIZES.sm, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: "#f8fafc", borderRadius: RADIUS.md,
        paddingHorizontal: 16, paddingVertical: 14,
        fontSize: SIZES.md, color: COLORS.textPrimary,
    },

    btn: { borderRadius: RADIUS.md, paddingVertical: 16, alignItems: "center" },
    btnText: { color: "#fff", fontSize: SIZES.lg, fontWeight: "700" },

    successBox: { alignItems: "center", paddingVertical: 20 },
    successIcon: { fontSize: 60, marginBottom: 16 },
    successTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.textPrimary, marginBottom: 12 },
    successDesc: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: "center", lineHeight: 24 }
});
