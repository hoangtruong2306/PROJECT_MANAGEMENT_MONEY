import client from "./client";

export const getUserGoals = (userId) => client.get(`/goals/user/${userId}`);
export const createGoal = (data) => client.post(`/goals`, data);
export const depositGoal = (goalId, amount) => client.patch(`/goals/${goalId}/deposit`, { amount });
