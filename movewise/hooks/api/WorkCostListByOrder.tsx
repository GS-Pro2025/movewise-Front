import apiClient from "./apiClient";

interface WorkCost{
    id_workCost : number;
    name: string;
    cost: string;
    type: string;
    id_order: string;
}export default WorkCost;

export const ListWorkCostByOrder = async (id_order: string): Promise<WorkCost[]> => {
    try {
        const response = await apiClient.get(`/workcost/order/${id_order}/`);
        return response.data.results;
    } catch (error) {
        console.error("Error fetching work costs by order:", error);
        throw error;
    }
}