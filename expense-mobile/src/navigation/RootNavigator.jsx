import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "../screens/auth/SplashScreen";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { user, loading } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {loading ? (
                // Always show Splash first; it redirects once auth state resolves
                <Stack.Screen name="Splash" component={SplashScreen} />
            ) : user ? (
                <Stack.Screen name="Main" component={MainNavigator} />
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    );
}
