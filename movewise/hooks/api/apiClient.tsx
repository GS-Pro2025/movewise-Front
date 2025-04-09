import axios, { AxiosInstance } from "axios";
export const  url = 'http://192.168.18.164:8000/'
export const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25faWQiOjIsImVtYWlsIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsImV4cCI6MTc0NDMwNTc0MiwiaWF0IjoxNzQ0MjE5MzQyfQ.duutc-pua4R9l8YKYdZmZoUtgQgSD2BJmQ8YJS9nX4c"
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