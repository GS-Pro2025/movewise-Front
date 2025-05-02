import apiClient from "./apiClient";

export const getPendingOrders = async () => {
    try{
        const response = await apiClient.get("/order/list_pending/");
        console.log(response.data)
        const data = response.data;

        // Extract the `results` array from the paginated response
        return data.results || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}
