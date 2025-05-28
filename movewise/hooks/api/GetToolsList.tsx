import apiClient from "./apiClient";

export const getToolsList = async (page: number = 1) => {
  const response = await apiClient.get(`/tools/?page=${page}`);
  return response.data; // Retorna { results: [], next: ... }
};
