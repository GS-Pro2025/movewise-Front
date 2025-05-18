import apiClient from "./apiClient";

export const SoftDeleteOperator = async (operator_id: number) => {
    try {
        const response = await apiClient.delete(`/operators/${operator_id}/delete/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching Operators:', error);
        throw error;
    }
}