import apiClient from "./apiClient";

export const getOrders = async () => {
    const response = await apiClient.get("/orders");
    console.log(response.data)
    return response.data;
};
