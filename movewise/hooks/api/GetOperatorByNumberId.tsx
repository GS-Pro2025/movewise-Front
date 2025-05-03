import apiClient from "./apiClient";

export const getOperatorByNumberId = async (number_id: string) => {
  console.log("📨 ID recibido para búsqueda de operador:", number_id);
  try {
    const response = await apiClient.get("/operators/" + number_id);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn("⚠️ Operador no encontrado con ID:", number_id);
      return { error: "operator not found" };
    }

    console.error("❌ Error inesperado al obtener operador:", error);
    return null;
  }
};
