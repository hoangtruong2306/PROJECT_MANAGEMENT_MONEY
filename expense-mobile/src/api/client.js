import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Change this to your machine's local IP when testing on a real device
// e.g., "http://192.168.1.x:5000/api"  (find with `ipconfig` on Windows)
const BASE_URL = "http://10.0.2.2:5000/api";
const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token from storage on every request
client.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default client;
