import React, { useState, useRef } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
    Animated, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../constants/colors";

const ACTIONS = [
    { icon: "💸", label: "Thêm giao dịch", key: "transaction" },
    { icon: "🏦", label: "Thêm ví", key: "wallet" },
    { icon: "✨", label: "Hỏi AI Gemini", key: "ai", isAI: true },
];

export default function SpeedDial({ onAction }) {
    const [open, setOpen] = useState(false);
    const rotate = useRef(new Animated.Value(0)).current;
    const itemAnims = ACTIONS.map(() => useRef(new Animated.Value(0)).current);

    const toggle = () => {
        const toOpen = !open;
        setOpen(toOpen);

        Animated.timing(rotate, {
            toValue: toOpen ? 1 : 0,
            duration: 220,
            useNativeDriver: true,
        }).start();

        const anims = itemAnims.map((anim, i) =>
            Animated.timing(anim, {
                toValue: toOpen ? 1 : 0,
                duration: 180,
                delay: toOpen ? i * 50 : (ACTIONS.length - 1 - i) * 40,
                useNativeDriver: true,
            })
        );
        Animated.stagger(40, anims).start();
    };

    const handleAction = (key) => {
        setOpen(false);
        Animated.timing(rotate, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        itemAnims.forEach(a => Animated.timing(a, { toValue: 0, duration: 150, useNativeDriver: true }).start());
        onAction?.(key);
    };

    const rotateInterpolate = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] });

    return (
        <>
            {/* Backdrop */}
            {open && (
                <TouchableWithoutFeedback onPress={toggle}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>
            )}

            <View style={styles.container}>
                {/* Action Items */}
                {ACTIONS.map((action, i) => {
                    const anim = itemAnims[i];
                    return (
                        <Animated.View
                            key={action.key}
                            style={[
                                styles.actionItem,
                                {
                                    opacity: anim,
                                    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                                    pointerEvents: open ? "auto" : "none",
                                },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => handleAction(action.key)}
                                style={styles.actionRow}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.actionLabel, action.isAI && styles.actionLabelAI]}>
                                    <Text style={[styles.actionLabelText, action.isAI && { color: "#7c3aed" }]}>{action.label}</Text>
                                </View>
                                <View style={[styles.miniBtn, action.isAI && styles.miniBtnAI]}>
                                    <Text style={{ fontSize: 18 }}>{action.icon}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}

                {/* Main FAB */}
                <TouchableOpacity onPress={toggle} activeOpacity={0.85} style={styles.fabWrapper}>
                    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.fab}>
                        <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: rotateInterpolate }] }]}>
                            ✦
                        </Animated.Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.15)", zIndex: 900 },
    container: {
        position: "absolute",
        bottom: Platform.OS === "ios" ? 90 : 74,
        right: 20,
        alignItems: "flex-end",
        zIndex: 1000,
    },
    actionItem: { marginBottom: 10 },
    actionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    actionLabel: {
        backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
    },
    actionLabelAI: { borderWidth: 1, borderColor: "#e9d5ff" },
    actionLabelText: { fontSize: 13, fontWeight: "600", color: "#374151" },
    miniBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
        shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
    },
    miniBtnAI: { backgroundColor: "#faf5ff" },
    fabWrapper: { marginTop: 10 },
    fab: {
        width: 58, height: 58, borderRadius: 29,
        justifyContent: "center", alignItems: "center",
        shadowColor: COLORS.primary, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
    },
    fabIcon: { fontSize: 22, color: "#fff", fontWeight: "900" },
});
