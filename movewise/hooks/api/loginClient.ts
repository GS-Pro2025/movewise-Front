import apiClient from "./apiClient"; // ajusta el path si es necesario

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  name?: string;
  message?: string;
}

export async function loginUser(credentials: LoginRequest | { id_number: string }): Promise<LoginResponse> {
  try {
    const response = await apiClient.post("/login/", credentials);
    return response.data;
  } catch (error: any) {
    // Capturar el mensaje del backend directamente
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        "Login failed";
    throw new Error(errorMessage);
  }
}
