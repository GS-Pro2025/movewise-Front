// hooks/useOrderApi.ts
import { useState } from 'react';
import { AddOrderForm } from '../models/ModelAddOrderForm';

const AddOrderformApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveOrder = async (orderData: AddOrderForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la orden');
      }

      console.log('Order saved successfully!', data);
      return data;  // Retorna la respuesta en caso de éxito

    } catch (err: any) {
      console.error('Error saving order:', err.message);
      setError(err.message); // Almacena el mensaje de error
      return null; // En caso de error, retorna null
    } finally {
      setIsLoading(false);
    }
  };

  return { saveOrder, isLoading, error };
};

export default AddOrderformApi;
