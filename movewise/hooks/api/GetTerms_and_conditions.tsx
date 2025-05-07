import apiClient from "./apiClient";

// Obtener los términos y condiciones como HTML
export const getTerms_and_conditions = async () => {
  try {
    const response = await apiClient.get("getTermsAndConditions/");
    return response.data; // Retorna el HTML como string
  } catch (error) {
    console.error("Error getting terms and conditions:", error);
    throw error;
  }
};