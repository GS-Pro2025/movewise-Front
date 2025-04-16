import apiClient from './apiClient';
import { ModelAddTruck } from "@/models/ModelAddTruck";

interface Truck {
  id: string;
  licensePlate: string;
  model: string;
  capacity: string;
  status: string;
}

// GET /trucks/ (camiones disponibles)
export const ListTruck = async (): Promise<{ data: Truck[] }> => {
  const response = await apiClient.get('/trucks/?page=1&page_size=10');
  return { data: response.data.results.data }; 
};



// POST /trucks/
export const CreateTruck = async (data: ModelAddTruck): Promise<Truck> => {
  try {
    const response = await apiClient.post("/trucks/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating truck:", error);
    throw error;
  }
};

// GET /truck-by-id/<id_truck>/
export const GetTruckById = async (id_truck: string): Promise<Truck> => {
  try {
    const response = await apiClient.get(`/truck-by-id/${id_truck}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting truck by ID:", error);
    throw error;
  }
};

// DELETE /trucks/<pk>/delete/
export const DeleteTruck = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/trucks/${id}/delete/`);  // Asegúrate de que esta ruta coincida con la del backend
  } catch (error) {
    console.error("Error deleting truck:", error);
    throw error;
  }
};

// PATCH /trucks/<pk>/ (para actualizar estado)
export const UpdateTruckStatus = async (id: string, status: string): Promise<Truck> => {
  try {
    const response = await apiClient.patch(`/trucks/${id}/`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating truck status:", error);
    throw error;
  }
};

// PUT /trucks/<pk>/update/ (si necesitas actualizar el camión completamente)
export const UpdateTruck = async (id: string, data: ModelAddTruck): Promise<Truck> => {
  try {
    const response = await apiClient.put(`/trucks/${id}/update/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating truck:", error);
    throw error;
  }
};
