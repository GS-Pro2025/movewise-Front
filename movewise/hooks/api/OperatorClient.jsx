import apiClient from './apiClient';

export const ListOperator = async () => {
  try {
    const response = await apiClient.get('/operators');
    return response.data;
  } catch (error) {
    console.error('Error al listar operators:', error);
    throw error;

  }
};
//para obtener o enviar los datos necesarios