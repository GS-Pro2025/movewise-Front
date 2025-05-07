import apiClient from "./apiClient";

export const deleteAssign = async (id: number) => {
    try {
        const response = await apiClient.delete(`assigns/${id}/`);
        console.log("Assign deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting assign:", error);
        throw error;
    }
};