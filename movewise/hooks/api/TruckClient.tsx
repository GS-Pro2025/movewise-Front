import apiClient from './apiClient';
import { ModelAddTruck } from "@/models/ModelAddTruck"; 

export const ListTruck = async () => {
  try {
    const response = await apiClient.get('/trucks');
    return response.data;
  } catch (error) {
    console.error('Error al listar trucks:', error);
    throw error;

  }
};
export const CreateTruck = async (data: ModelAddTruck) => {
  try {
    const response = await apiClient.post("/trucks/", data);
    return response.data;
  } catch (error) {
    console.error("Error al crear truck:", error);
    throw error;
  }
};
//para obtener o enviar los datos necesarios