import client from "./client";

export const getUserBudgets = (userId) => client.get(`/budgets/user/${userId}`);
export const createBudget = (data) => client.post(`/budgets`, data);
export const updateBudget = (id, data) => client.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => client.delete(`/budgets/${id}`);
