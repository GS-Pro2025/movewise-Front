import apiClient from './apiClient';
export interface Job {
  id: number;
  name: string;
}
export interface CreateJobModel{
  name: string;
}
export const ListJobs = async () => {
  try {
    const response = await apiClient.get('/jobs');
    console.log('Jobs list:', response.data); // Log the response data for debugging
    return response.data;
  } catch (error) {
    console.error('Error al listar jobs:', error);
    throw error;
  }
};

export const createJob = async (job: CreateJobModel) => {
  try {
    const response = await apiClient.post('/jobs/', job);
    console.log('Job created:', response.data); // Log the response data for debugging
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

export const deleteJob = async (jobId: number) => {
  try {
    const response = await apiClient.patch(`/job/${jobId}/delete/`);
    console.log('Job deleted:', response.data); // Log the response data for debugging
    return response.data;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}