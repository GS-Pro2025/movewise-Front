import apiClient from "./apiClient";

export interface FreelanceData {
    code: string;
    salary: number;
    status: 'freelance';
    first_name: string;
    last_name: string;
    type_id: string;
    id_number: string;
    address?: string;
    phone?: string;
    photo?: string;
    license_front?: string;
    license_back?: string;
}

export const GetFreelanceByCode = async (code: string) => {
    try {
        const response = await apiClient.get(`/freelance/by-code/?code=${code}`);
        return response.data;
    } catch (error: any) {
        return 
        // console.error('Error fetching freelance:', error.response?.data || error.message);
        throw error;
    }
};

export const CreateFreelance = async (data: FormData) => {
    try {
        const response = await apiClient.post('/operators/create/', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error creating freelance:', error.response?.data || error.message);
        throw error;
    }
};