import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SplashScreen from "../components/Shared/SplashScreen";

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <SplashScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        // If user is not admin, redirect to user dashboard
        return <Navigate to="/" replace />;
    }

    return children;
}
