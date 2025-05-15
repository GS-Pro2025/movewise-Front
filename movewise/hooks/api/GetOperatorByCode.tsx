import apiClient from "./apiClient";

export const getOperatorByCode = async (code: string) => {
    try {
        const response = await apiClient.get(`/operator-code/${code}/`);
        if (response.status === 404) {
            return {
                error: "operator not found"
            }
        }
        return response.data;
    } catch {
        return null;
    }
};
