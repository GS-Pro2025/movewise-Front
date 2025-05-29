import apiClient from "./apiClient";

interface OrderPerson {
  email: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  phone: number | null;
}

interface Order {
  key: string;
  key_ref: string;
  date: string | null;
  distance: number | null;
  expense: string | null;
  income: string | null;
  weight: string;
  status: string;
  payStatus: number | null;
  state_usa: string;
  person: OrderPerson;
  job: number;
  job_name: string | null;
  evidence: string | null;
  dispatch_ticket: string | null;
  customer_factory: number;
  customer_factory_name: string | null;
}

export interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

// hooks/api/GetOrders.ts
export const getOrders = async (url?: string): Promise<OrdersResponse> => {
  try {
    const endpoint = url || '/orders/';
    const response = await apiClient.get<{
      status: string;
      data: OrdersResponse; // Ajustar para recibir la estructura correcta
    }>(endpoint);

    return response.data.data; // Devuelve directamente el objeto de paginación
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// hooks/api/GetOrders.ts
export const getOrdersAllStatus = async (
  url?: string,
  filters?: {
    date?: Date | null;
    status?: string | null;
    search?: string | null;
  }
): Promise<OrdersResponse> => {
  try {
    let endpoint = url || '/orders-all-status/';
    const params = new URLSearchParams();

    if (filters?.date) {
      params.append('date', filters.date.toISOString().split('T')[0]); // Formato YYYY-MM-DD
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    // Si hay parámetros, añadirlos al endpoint
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const response = await apiClient.get<{
      status: string;
      data: OrdersResponse;
    }>(endpoint);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};


export default Order;
