import apiClient from "./apiClient";

interface DeleteOrderResponse {
    message: string;
}

export const DeleteOrder = async (key: string): Promise<DeleteOrderResponse> => {
    const response = await apiClient.patch("/orders/" + key+ "/deleteWithStatus/");
    return response.data;
};