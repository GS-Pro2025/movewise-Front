import apiClient from "./apiClient";

export const GetFreelancers = async () => {
    try {
        const response = await apiClient.get(`/list-operators-freelance/`)
        return response.data
    } catch (error) {
        console.error('Error fetching Freelancers:', error);
        throw error;
    }
}