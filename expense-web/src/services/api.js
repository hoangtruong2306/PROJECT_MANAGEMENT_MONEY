import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const addExpense = (data) => API.post("/expenses", data);
export const getPrediction = () => API.get("/ai/predict");
