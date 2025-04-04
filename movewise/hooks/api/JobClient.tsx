import apiClient from './apiClient';

export const ListJobs = async () => {
  
  try {
    // Starting request to /api/jobs/
    // Iniciando petición a /api/jobs/
    console.log('JobClient: Starting request to /api/jobs/');
    const response = await apiClient.get('/jobs/');
    console.log('JobClient: Response received:', response);
    
    // Check if response has data
    // Verificar si la respuesta tiene datos
    if (!response || !response.data) {
      console.warn('JobClient: Response contains no data');
      return [];
    }

    // If response is successful but empty, return empty array
    // Si la respuesta es exitosa pero vacía, retornar array vacío
    if (response.data.length === 0) {
      console.log('JobClient: No jobs found');
      return [];
    }

    // Process and return data
    // Procesar y retornar datos
    console.log('JobClient: Processed data:', response.data);
    return response.data;
  } catch (error) {
    console.error('JobClient: Error listing jobs:', error);
    throw error;
  }
};
// To get or send the necessary data
// Para obtener o enviar los datos necesarios