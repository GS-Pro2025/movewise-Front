// src/hooks/api/UpdateWorkHouse.ts
import apiClient from "./apiClient";

export const UpdateWorkhouseOrder = async (orderKey: string, orderData: any) => {
  try {
    const response = await apiClient.patch(`/orders/${orderKey}/`, orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    let errorMessage = 'Unknown error';
    if (error.response) {
      errorMessage = error.response.data?.message || error.response.data?.detail || error.response.statusText;
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};