import apiClient from "./apiClient";

export const SoftDeleteOperator = async (operator_id: number) => {
    try {
        
        const response = await apiClient.delete(`/operators/${operator_id}/delete/`)
        return response.data
    } catch (error) {
        console.error('Error deleting Operator:', error);
        throw error;
    }
}