import React, { useState } from "react";
import { View, Text, DeviceEventEmitter } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home/HomeScreen";
import AnalyticsScreen from "../screens/analytics/AnalyticsScreen";
import FinanceScreen from "../screens/finance/FinanceScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import SpeedDial from "../components/FAB/SpeedDial";
import AddTransactionModal from "../components/Transaction/AddTransactionModal";
import ChatbotModal from "../components/Chat/ChatbotModal";
import { COLORS } from "../constants/colors";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    Home: "🏠",
    Analytics: "📈",
    Finance: "🎯",
    Settings: "⚙️",
};

const TAB_LABELS = {
    Home: "Tổng quan",
    Analytics: "Thống kê",
    Finance: "Mục tiêu",
    Settings: "Cài đặt",
};

export default function MainNavigator() {
    const [addTxVisible, setAddTxVisible] = useState(false);
    const [chatVisible, setChatVisible] = useState(false);

    const handleSpeedDialAction = (key) => {
        if (key === "transaction") setAddTxVisible(true);
        if (key === "ai") setChatVisible(true);
        // Handle 'wallet' later if needed
    };

    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: true,
                    headerStyle: { backgroundColor: "#fff" },
                    headerTitleStyle: { color: COLORS.textPrimary, fontWeight: "700" },
                    headerTitle: TAB_LABELS[route.name],
                    tabBarIcon: ({ focused }) => (
                        <Text style={{ fontSize: focused ? 24 : 20 }}>{TAB_ICONS[route.name]}</Text>
                    ),
                    tabBarLabel: ({ focused }) => (
                        <Text style={{
                            fontSize: 10, fontWeight: focused ? "700" : "400",
                            color: focused ? COLORS.primary : COLORS.textMuted,
                            marginBottom: 2,
                        }}>
                            {TAB_LABELS[route.name]}
                        </Text>
                    ),
                    tabBarStyle: {
                        backgroundColor: "#fff",
                        borderTopColor: "#f1f5f9",
                        paddingTop: 6, height: 64,
                    },
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textMuted,
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Analytics" component={AnalyticsScreen} />
                <Tab.Screen name="Finance" component={FinanceScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>

            {/* Speed Dial FAB sits above the tab bar, outside the Navigator */}
            <SpeedDial onAction={handleSpeedDialAction} />

            {/* Modals outside navigator bounds */}
            <AddTransactionModal
                visible={addTxVisible}
                onClose={() => setAddTxVisible(false)}
                onSuccess={() => {
                    setAddTxVisible(false);
                    // Tell HomeScreen to refresh data automatically
                    DeviceEventEmitter.emit("refreshHome");
                }}
            />

            <ChatbotModal
                visible={chatVisible}
                onClose={() => setChatVisible(false)}
            />
        </View>
    );
}
