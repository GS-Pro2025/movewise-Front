// GetAssignToolByOrder.ts - Versión corregida
import apiClient from "./apiClient";

export const GetAssignToolByOrder = async (key: string) => {
    const cleanedKey = key.trim();
    try {
      const response = await apiClient.get(`/assignTool/order/${cleanedKey}/`);
      return response.data.results || [];  // <<< Acceder a .results
    } catch (error) {
      throw error;
    }
  };