# Task: Scaffold expense-mobile (React Native + Expo)

## Phase 1 — Setup & Scaffold
- [x] Run `npx create-expo-app@latest expense-mobile` in d:\PROJECT_MANGEMENT
- [x] Install dependencies: axios, @react-navigation/native, @react-navigation/bottom-tabs, react-native-screens, react-native-safe-area-context, @react-native-async-storage/async-storage, expo-linear-gradient, react-native-gesture-handler, react-native-reanimated, @gorhom/bottom-sheet
- [x] Setup folder structure: src/api, src/screens, src/components, src/context, src/utils, src/constants

## Phase 2 — Core Files
- [x] src/constants/colors.js — design tokens (purple palette)
- [x] src/api/client.js — Axios instance pointing at expense-backend
- [x] src/api/auth.js — login, register calls
- [x] src/api/transactions.js — CRUD transactions
- [x] src/api/stats.js — summary stats
- [x] src/api/ai.js — chatWithAI
- [x] src/context/AuthContext.js — token storage, user state
- [x] src/utils/format.js — currency / date formatters

## Phase 3 — Auth Screens
- [x] src/screens/auth/SplashScreen.jsx
- [x] src/screens/auth/LoginScreen.jsx
- [x] src/screens/auth/RegisterScreen.jsx

## Phase 4 — Main App Screens
- [x] src/screens/home/HomeScreen.jsx
- [x] src/screens/analytics/AnalyticsScreen.jsx (To do: Add charts)
- [/] src/screens/finance/FinanceScreen.jsx (To do: Goals & Budgets)
- [x] src/screens/settings/SettingsScreen.jsx

## Phase 5 — Navigation
- [x] src/navigation/AuthNavigator.jsx
- [x] src/navigation/MainNavigator.jsx (Bottom Tabs)
- [x] src/navigation/RootNavigator.jsx

## Phase 6 — Shared Components
- [x] src/components/FAB/SpeedDial.jsx
- [x] src/components/Chat/ChatbotModal.jsx (Bottom Sheet AI)
- [x] src/components/Transaction/AddTransactionModal.jsx

## Phase 7 — Entry Point
- [x] App.js wired to RootNavigator

## Phase 8 — Redesign Auth Screens (Web & Mobile)
- [x] Mobile: Add `expense_app_logo.png` to assets
- [x] Mobile: Redesign `LoginScreen.jsx` & `RegisterScreen.jsx` (Card form, Eye toggle)
- [x] Mobile: Create `ForgotPasswordScreen.jsx` & add to `AuthNavigator.jsx`
- [x] Web: Redesign `Login.jsx` (Split screen, Logo, Eye toggle)
- [x] Web: Redesign `Register.jsx` (Split screen, Logo, Eye toggle)
- [x] Web: Redesign `ForgotPassword.jsx` & `ResetPassword.jsx` (Split screen)
