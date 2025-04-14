import axios, { AxiosInstance } from "axios";
export const  url = 'http://192.168.1.10:8000/'
export const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25faWQiOjgsImVtYWlsIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsImlzX2FkbWluIjp0cnVlLCJleHAiOjE3NDQ3NDUwNTksImlhdCI6MTc0NDY1ODY1OX0.le8SOwal4quX6K-GF8XxkGA4IYCRaeApOe-veEiB9AQ"
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