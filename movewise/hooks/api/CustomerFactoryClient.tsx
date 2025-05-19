import apiClient from "./apiClient";
//customer-factories/
export const DeleteCompany = async (id: number) => {
  try {
    const response = await apiClient.delete(`/customer-factories/${id}/`)
    return response.data
  } catch (error) {
    console.error('Error al eliminar company', error)
    throw error
  }
}


export interface Customer {
  id_factory: number;
  name: string;
}

export const CustomerFactory = async () => {
  try {
    const response = await apiClient.get('/customer-factories/');
    console.log("lista de customers", response.data);
    return response.data;
  } catch (error) {
    console.error('Error to get customer factory:', error);
    throw error;
  }
};
export interface ModelCreateCustomerFactory {
  name: String;
}
export const CreateCustomerFactory = async (customerData: ModelCreateCustomerFactory) => {
  try {
    const response = await apiClient.post('/customer-factories/', customerData);
    return response.data;
  } catch (error) {
    console.error('Error al crear customer:', error);
    throw error;
  }
}