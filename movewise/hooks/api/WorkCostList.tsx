import apiClient from "./apiClient"

interface WorkCost{
    id_workCost : number;
    name: string;
    cost: string;
    type: string;
    id_order: string;
}export default WorkCost;
//Its missing thinking if its better to bring the date for filtering in frontend or backend, for now we will bring all the data and filter in frontend
export const ListWorkCost = async (page: number, page_size: number): Promise<{ data: WorkCost[]; next: string | null }> => {
    try {
        const response = await apiClient.get(`/workcost/?page=${page}&page_size=${page_size}`);
        return {
        data: response.data.results,
        next: response.data.next, // URL for the next page
        };
    } catch (error) {
        console.error("Error fetching work costs:", error);
        throw error;
    }
};