import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import AdminLayout from "../layout/AdminLayout";

import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import Finance from "../pages/Finance";
import AddTransaction from "../pages/AddTransaction";
import AddAccount from "../pages/AddAccount";
import AddGoal from "../pages/AddGoal";
import EditBudget from "../pages/EditBudget";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />

        {/* shortcut route used by FAB/actions from other components */}
        <Route path="/transactions/new" element={<Navigate to="/finance/transaction/new" replace />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* Bọc MainLayout bằng ProtectedRoute để chỉ user đã login mới truy cập được */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="finance" element={<Finance />} />
          <Route path="finance/transaction/new" element={<AddTransaction />} />
          <Route path="finance/account/new" element={<AddAccount />} />
          <Route path="finance/goal/new" element={<AddGoal />} />
          <Route path="finance/budget/edit" element={<EditBudget />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
