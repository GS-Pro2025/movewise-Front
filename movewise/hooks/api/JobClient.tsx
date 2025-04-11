import apiClient from './apiClient';

export const ListJobs = async () => {
  try {
    const response = await apiClient.get('/jobs');
    console.log('Jobs list:', response.data); // Log the response data for debugging
    return response.data;
  } catch (error) {
    console.error('Error al listar jobs:', error);
    throw error;
  }
};