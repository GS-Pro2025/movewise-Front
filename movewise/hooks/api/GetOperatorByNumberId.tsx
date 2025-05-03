import apiClient from "./apiClient";

export const getOperatorByNumberId = async (number_id: string) => {
    try {
        const response = await apiClient.get("/operators/" + number_id);
        if (response.status === 404) {
            return {
                error: "operator not found"
            }
        }
        console.log(response.data)
        return response.data;
    } catch {
        return null;
    }
};
