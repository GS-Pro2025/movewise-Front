import apiClient from './apiClient';

export const UpdateOperator = async (id: number, formData: FormData) => {
  try {
    const response = await apiClient.put(`/operators/update/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error updating operator:', error);
    throw error;
  }
};