import apiClient from "./apiClient";

interface WorkCost {
    name: string;
    cost: string;
    type: string;
    id_order: string;
} export default WorkCost;

export const BulkCreateWorkCost = async (data: WorkCost[]): Promise<WorkCost[]> => {
    try {
        const response = await apiClient.post("/workCost/bulkCreate/", data);
        return response.data;
    } catch (error) {
        console.error("Error creating work costs:", error);
        throw error;
    }
}

