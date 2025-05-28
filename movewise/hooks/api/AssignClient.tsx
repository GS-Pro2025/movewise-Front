import apiClient from "./apiClient";

export interface AssignmentData {
    operator: number;
    workhouse_key?: string;
    truck?: number | null;
    order: string;
    assigned_at: string;
    rol: 'driver' | 'freelance';
    additional_costs: string;
}

export const CreateAssignment = async (data: AssignmentData) => {
    try {
        const response = await apiClient.post('/assigns/', data);
        return response.data;
    } catch (error: any) {
        console.error('Error creating assignment:', error.response?.data || error.message);
        throw error;
    }
};