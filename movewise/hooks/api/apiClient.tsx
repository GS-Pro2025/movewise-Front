import axios, { AxiosInstance } from "axios";

export const  url = 'http://192.168.1.6:8000/'
export const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25faWQiOjEsImVtYWlsIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsImlzX2FkbWluIjp0cnVlLCJleHAiOjE3NDQ2NzE4OTMsImlhdCI6MTc0NDU4NTQ5M30.KNsD_ARi79XEMV4V5pksHCFS3m7xl4axuwlne_gHiEc"

import AsyncStorage from "@react-native-async-storage/async-storage";

let token = null;

const apiClient: AxiosInstance = axios.create({
  baseURL: url,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar el token en los headers
apiClient.interceptors.request.use(async (config) => {
  token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas y errores globales
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
export { token };
export default apiClient;