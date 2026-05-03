import client from "./client";

export const getUserWallets = (userId) => client.get(`/wallets/user/${userId}`);
export const createWallet = (data) => client.post("/wallets", data);
export const deleteWallet = (id) => client.delete(`/wallets/${id}`);
export const depositWallet = (id, amount) => client.patch(`/wallets/${id}/deposit`, { amount });
