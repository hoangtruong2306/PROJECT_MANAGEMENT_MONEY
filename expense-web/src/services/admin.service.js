import API from "./api";

export const getAdminStats = () => API.get("/admin/stats");
export const getAllUsers = () => API.get("/admin/users");
export const deleteUser = (userId) => API.delete(`/admin/users/${userId}`);
export const resetUserPassword = (userId, password) => API.put(`/admin/users/${userId}/password`, { password });
