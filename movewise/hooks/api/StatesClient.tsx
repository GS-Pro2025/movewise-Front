import apiClient from './apiClient';

export const ListStates = async () => {
  try {
    const response = await apiClient.get('/orders-states/');
    return response.data;
    
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

