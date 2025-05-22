import apiClient from "./apiClient";
import { WorkhouseOrderData } from "@/app/modals/workhouse/AddWorkhouseForm";

export const createWorkhouseOrder = async (orderData: WorkhouseOrderData) => {
  try {
    const formData = new FormData();

    // Agregar campos básicos
    Object.entries(orderData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await apiClient.post('/workhouse/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    let errorMessage = 'Unknown error';

    if (error.response) {
      errorMessage = error.response.data?.message ||
        error.response.data?.detail ||
        error.response.statusText;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};