import apiClient from "./apiClient";

export interface PersonInfo {
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: number;
  address: string;
  id_number: string;
  type_id: string;
  id_company: number;
}

export interface AdminInfo {
  user_name: string;
  person: PersonInfo;
  created_at: string;
  updated_at: string;
}

// En GetAdminByToken.ts
export const GetAdminInfo = async (): Promise<AdminInfo> => {  // Cambiar AdminInfo[] por AdminInfo
  try {
    const response = await apiClient.get("/profile/");
    return response.data;  // Retorna el objeto directamente
  } catch (error) {
    console.error("Error fetching admin info:", error);
    throw error;
  }
};
