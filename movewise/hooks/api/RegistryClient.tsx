import apiClient from './apiClient'; // Adjust the path as needed

interface Person {
    email: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    phone: string;
    address: string;
    id_number: string;
    type_id: string;
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