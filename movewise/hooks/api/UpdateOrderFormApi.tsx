// hooks/api/UpdateOrderFormApi.ts
import { useState } from 'react';
import { token, url } from './apiClient';

interface UpdateOrderFormData {
  key_ref: string;
  date: string;
  distance: number;
  expense: string;
  income: string;
  weight: string;
  status: string;
  payStatus: number;
  state_usa: string;
  person: {
    email: string;
    first_name: string;
    last_name: string;
  };
  job: number;
}

interface ErrorResponse {
  data: null;
  messDev: string;
  messUser: string;
  status: string;
}

const UpdateOrderFormApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorData, setErrorData] = useState<ErrorResponse | null>(null);

  const updateOrder = async (orderKey: string, orderData: UpdateOrderFormData) => {
    setIsLoading(true);
    setErrorData(null);

    try {
      const response = await fetch(`${url}/orders/${orderKey}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        // console.log('Error response:', response);
        // console.log('Error data:', data);
        setErrorData(data);
        return { success: false, errorMessage: data.messDev || 'Error updating the order' };
      }
      
      return { success: true, data };

    } catch (err: any) {
      console.error('Error updating order:', err.message);
      setErrorData({
        data: null,
        messDev: err.message,
        messUser: 'An unexpected error occurred',
        status: 'error'
      });
      return { success: false, errorMessage: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateOrder, isLoading, errorData };
};

export default UpdateOrderFormApi;