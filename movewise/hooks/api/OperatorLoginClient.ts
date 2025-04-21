import apiClient from "./apiClient"; // ajusta el path si es necesario

export interface LoginRequest {
  id_number: String;
}

export interface LoginResponse {
  token?: string;
  name?: string;
  message?: string;
}

export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
    console.log("Invocando login back")
  try {
    const response = await apiClient.post("/login/", credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
}
