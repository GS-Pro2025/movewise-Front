import apiClient from "./apiClient";

export const deleteAssign = async (id: number) => {
  try {
    await apiClient.delete(`assigns/${id}/`);
    return true;
  } catch (error: any) {
    if (error.response) {
      console.error("Server error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Other error:", error.message);
    }
    throw error;
  }
};