import apiClient from "./apiClient";

export const SoftDeleteOperator = async (operator_id: number) => {
    try {
        console.log(`id recibido en eliminar: ${operator_id}`);
        
        const response = await apiClient.delete(`/operators/${operator_id}/delete/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error deleting Operator:', error);
        throw error;
    }
}