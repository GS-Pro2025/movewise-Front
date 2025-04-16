import apiClient from './apiClient'; // Adjust the path as needed

interface Person {
    email: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    phone: number;
    address: string;
    id_number: number;
    type_id: string;
    state: string; // Added state
    city: string;  // Added city
    zip_code: string; // Added zip_code
}

interface RegisterRequestBody {
    user_name: string;
    password: string;
    person: Person;
}

export const registerUser = async (data: RegisterRequestBody) => {
    try {
        const response = await apiClient.post('/register/', data);
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};