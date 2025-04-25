import apiClient from "./apiClient";

export const ListOperators = async (page = 1) => {
    try {
        const response = await apiClient.get('/operators/?page=' + page )
        return response.data
    } catch (error) {
        console.error('Error fetching Operators:', error);
        throw error;
    }
}