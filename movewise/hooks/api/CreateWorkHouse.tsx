import apiClient from "./apiClient";
import { WorkhouseOrderData } from "@/app/modals/workhouse/AddWorkhouseForm";

export const createWorkhouseOrder = async (orderData: WorkhouseOrderData) => {
  try {
    const response = await apiClient.post('/workhouse/', orderData, {
      headers: {
        'Content-Type': 'application/json', 
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