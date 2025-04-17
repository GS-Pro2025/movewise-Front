import axios, { AxiosInstance } from "axios";
export const  url = 'http://192.168.101.21:8000/'
export const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25faWQiOjIsImVtYWlsIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsImlzX2FkbWluIjp0cnVlLCJleHAiOjE3NDQ4NTM0ODYsImlhdCI6MTc0NDc2NzA4Nn0.ci9HqFs433XF0g8i4Sre8W1ONwyOYKCAGCFdKL2xbXE"
const apiClient: AxiosInstance = axios.create({
  baseURL: url,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
// Interceptor para manejar respuestas y errores globales
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
  
  export default apiClient;
  //configuracioo hecha para la apiclient 