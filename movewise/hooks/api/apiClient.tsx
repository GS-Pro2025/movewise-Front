import axios, { AxiosInstance } from "axios";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25faWQiOjEsImVtYWlsIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsImV4cCI6MTc0NDEyNzQxMCwiaWF0IjoxNzQ0MDQxMDEwfQ.wQhjt7fbz7RmaJDTtdzi2PPy2g6skgAHFXmO2d-MvEA"
const apiClient: AxiosInstance = axios.create({
  baseURL: "IPLOCAL:8000/",
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