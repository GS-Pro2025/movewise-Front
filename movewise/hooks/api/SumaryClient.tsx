import apiClient from './apiClient'; // Adjust the path as needed

interface Summary{
    [x: string]: any;
    expense: string;
    rentingCost: string;
    fuelCost: string;
    workCost: string;
    driverSalaries: string;
    otherSalaries: string; //Other cost
    totalCost: string; 
}

export const getSummary = async (reference: string) =>{
    try {
        const response = await apiClient.get<Summary>(`/orders/${reference}/summary-cost/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching summary:', error);
        throw error;
    }
}