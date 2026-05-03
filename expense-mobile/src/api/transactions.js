import client from "./client";

// Transactions belong to a user — pass userId explicitly
export const getTransactions = (userId, params) =>
    client.get(`/transactions/user/${userId}`, { params });

export const getRecentTransactions = (userId) =>
    client.get(`/transactions/recent/${userId}`);

export const createTransaction = (data) => client.post("/transactions", data);
export const deleteTransaction = (id) => client.delete(`/transactions/${id}`);
export const updateTransaction = (id, data) => client.put(`/transactions/${id}`, data);
