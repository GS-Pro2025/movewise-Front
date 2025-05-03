import axios, { AxiosInstance } from "axios";

<<<<<<< HEAD
export const  url = 'http://192.168.18.164:8000/'
=======
export const  url = 'http://192.168.1.13:8000/'
>>>>>>> 07cabdeb3e66b15e1a0c9d2cbf24029626481d65


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