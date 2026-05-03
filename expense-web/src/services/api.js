import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach token if present
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handler: if token expired/invalid (401), clear token and redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        sessionStorage.removeItem("token");
      } catch (e) { }
      // Force navigation to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const loginGoogle = (data) => API.post("/auth/google", data);
export const getMe = () => API.get("/auth/me");
export const forgotPassword = (data) => API.post("/auth/forgot", data);
export const resetPassword = (data) => API.post("/auth/reset", data);

// Transactions / Expenses
export const addExpense = (data) => API.post("/expenses", data);
export const getRecentTransactions = (userId) => API.get(`/transactions/recent/${userId}`);
export const getUserTransactions = (userId) => API.get(`/expenses/user/${userId}`);
export const getUserStats = (userId) => API.get(`/stats/user/${userId}`);
export const getCategoryStats = (userId) => API.get(`/stats/category/${userId}`);
export const getTrendStats = (userId) => API.get(`/stats/trend/${userId}`);
export const getCategories = () => API.get(`/categories`);
export const getUserWallets = (userId) => API.get(`/wallets/user/${userId}`);
export const getUserGoals = (userId) => API.get(`/goals/user/${userId}`);
export const createGoal = (data) => API.post(`/goals`, data);
export const depositGoal = (goalId, amount) => API.patch(`/goals/${goalId}/deposit`, { amount });
export const createWallet = (data) => API.post(`/wallets`, data);

// Profile & Password
export const updateProfile = (data) => API.put("/auth/profile", data);
export const changePassword = (data) => API.put("/auth/change-password", data);

// Budgets
export const getUserBudgets = (userId) => API.get(`/budgets/user/${userId}`);
export const createBudget = (data) => API.post(`/budgets`, data);
export const updateBudget = (id, data) => API.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);

// Other
export const getPrediction = () => API.get("/ai/predict");
export const chatWithAI = (data) => API.post("/ai/chat", data);

export default API;
