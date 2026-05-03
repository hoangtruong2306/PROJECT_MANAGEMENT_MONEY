import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as loginApi, register as registerApi } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session from storage on app start
    useEffect(() => {
        const restore = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("token");
                const storedUser = await AsyncStorage.getItem("user");
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.warn("Failed to restore session", e);
            } finally {
                setLoading(false);
            }
        };
        restore();
    }, []);

    const login = async (email, password) => {
        const res = await loginApi({ email, password });
        const { token: t, user: u } = res.data;
        await AsyncStorage.setItem("token", t);
        await AsyncStorage.setItem("user", JSON.stringify(u));
        setToken(t);
        setUser(u);
    };

    const register = async (name, email, password) => {
        await registerApi({ name, email, password });
        await login(email, password);
    };

    const logout = async () => {
        await AsyncStorage.multiRemove(["token", "user"]);
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
