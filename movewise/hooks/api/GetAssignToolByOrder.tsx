import apiClient from "./apiClient";

export const GetAssignToolByOrder = async (key: string) => {
    const response = await apiClient.get("/assignTool/order/" + key);
    return response.data;
};
