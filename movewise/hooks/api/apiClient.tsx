import axios, { AxiosInstance } from "axios";
export const  url = 'http://192.168.101.21:8000/'
export const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25faWQiOjIsImVtYWlsIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsImV4cCI6MTc0NDU5ODYyMywiaWF0IjoxNzQ0NTEyMjIzfQ.1l_bX9CESjkX5jHKzsamO4iha2-nKoEyZe89HFcecd4"
const apiClient: AxiosInstance = axios.create({
  baseURL: url,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
// Interceptor para manejar respuestas y errores globaless
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
  
  export default apiClient;
  //configuracioo hecha para la apiclient