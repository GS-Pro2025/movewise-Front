import apiClient from "./apiClient";

export const deleteAdmin = async (person_id: number) => {
    try {
        console.log(`id recibido en eliminar: ${person_id}`);
        
        const response = await apiClient.delete(`/admin-delete/${person_id}/`)
        return response.data
    } catch (error) {
        console.error('Error deleting Operator:', error);
        throw error;
    }
}