import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SplashScreen from "../components/Shared/SplashScreen";

// ProtectedRoute: nếu đang load auth thì hiển thị SplashScreen;
// nếu đã login thì render children, nếu chưa login thì chuyển hướng tới /login
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin users to their dashboard if they try to access user-only routes
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
