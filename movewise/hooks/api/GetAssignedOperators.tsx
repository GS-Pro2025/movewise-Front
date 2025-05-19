import apiClient from "./apiClient";

export const GetAssignedOperators = async (key : string) => {
    try {
        const response = await apiClient.get(`/assigns/order/${key}/operators`)
        return response.data
    } catch (error) {
        console.error('Error fetching assigned Operators:', error);
        throw error;
    }
}