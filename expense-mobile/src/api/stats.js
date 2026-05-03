import client from "./client";

export const getUserStats = (userId) => client.get(`/stats/user/${userId}`);
export const getMonthlyStats = (userId, year) => client.get(`/stats/monthly/${userId}`, { params: { year } });
export const getCategoryStats = (userId, params) => client.get(`/stats/category/${userId}`, { params });
export const getTrendStats = (userId) => client.get(`/stats/trend/${userId}`);
export const getDailyStats = (userId) => client.get(`/stats/daily/${userId}`);
