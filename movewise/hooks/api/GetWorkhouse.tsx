import apiClient from "./apiClient";

export const ListWorkHouse = async () => {
    try {
        const response = await apiClient.get('/workhouse/');
        // La respuesta real está en response.data.data.results
        console.log('Datos REALES:', response.data.data.results); 
        return response.data.data.results; // Devuelve el array de órdenes
    } catch (error) {
        console.error('Error fetching Work houses:', error);
        throw error;
    }
}