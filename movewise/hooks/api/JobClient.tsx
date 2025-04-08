import apiClient from './apiClient';

export const ListJobs = async () => {
  try {
    const response = await apiClient.get('/jobs');
    return response.data;
  } catch (error) {
    console.error('Error al listar jobs:', error);
    throw error;
  }
};