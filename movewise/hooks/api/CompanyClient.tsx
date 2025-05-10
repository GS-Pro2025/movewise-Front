import apiClient from './apiClient';
import { ModelCompany } from '@/models/ModelCompany';
export const ListCompanies = async () => {
  try {
    const response = await apiClient.get('/companies');
    console.log(`empresas: ${response.data.results}`);
    
    return response.data.results;
  } catch (error) {
    console.error('Error al listar companies:', error);
    throw error;
  }
};

export const CreateCompany = async (companyData: ModelCompany): Promise<ModelCompany> =>{
  try {
    const response = await apiClient.post('/companies/', companyData);
    return response.data;
  } catch (error) {
    console.error('Error al crear company:', error);
    throw error;
  }
}