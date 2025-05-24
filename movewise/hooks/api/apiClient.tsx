import axios, { AxiosInstance } from "axios";


export const  url = 'http://192.168.18.164:8000/'



import AsyncStorage from "@react-native-async-storage/async-storage";
let token : string | null ;

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
    // console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
export { token };
export default apiClient;
