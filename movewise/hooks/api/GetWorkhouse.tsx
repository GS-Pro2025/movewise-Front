import apiClient from "./apiClient";

export interface WorkHouseResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: any[];
}

export const ListWorkHouse = async (page: number = 1): Promise<WorkHouseResponse> => {
    console.log(`Fetching workhouse data, page: ${page}`);
    
    try {
        // console.log('Making API call to /workhouse/');
        const response = await apiClient.get(`/workhouse/?page=${page}`);
        // console.log('API Response:', JSON.stringify(response.data, null, 2));
        
        // Check if the response has the expected structure
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            // If the response is already in the correct format
            return response.data;
        }
        
        throw new Error('Unexpected API response format');
    } catch (error: any) {
        console.error('Error in ListWorkHouse:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
}