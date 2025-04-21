import apiClient from "./apiClient";

export const getOperatorById = async (id: number) => {
    try {
        const response = await apiClient.get("/operators-by-id/" + id);
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
