import axios, { AxiosInstance } from "axios";
export const  url = 'http://192.168.1.11:8000/'
export const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25faWQiOjEsImVtYWlsIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsImV4cCI6MTc0NDMyNTI1MSwiaWF0IjoxNzQ0MjM4ODUxfQ.BIj4Z4uPgFIdPs9GNYXpH3P_nxFoavsuq8b5QtBYNkw"
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