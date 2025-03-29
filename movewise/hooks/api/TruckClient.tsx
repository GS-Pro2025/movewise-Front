import apiClient from './apiClient';

export const ListTruck = async () => {
  try {
    const response = await apiClient.get('/trucks');
    return response.data;
  } catch (error) {
    console.error('Error al listar trucks:', error);
    throw error;

  }
};
//para obtener o enviar los datos necesarios