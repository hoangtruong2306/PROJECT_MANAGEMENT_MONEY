import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/colors";

export default function SplashScreen({ navigation }) {
    const { user, loading } = useAuth();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                navigation.replace(user ? "Main" : "Login");
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [loading, user]);

    return (
        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
            <Animated.View style={[styles.logoBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.logo}>💰</Text>
                <Text style={styles.appName}>ExpenseTracker</Text>
                <Text style={styles.tagline}>Quản lý chi tiêu thông minh</Text>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    logoBox: { alignItems: "center", gap: 8 },
    logo: { fontSize: 64 },
    appName: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
    tagline: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
});
