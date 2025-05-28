import apiClient from "./apiClient";
interface OrderPerson {
    email: string;
    first_name: string | null;
    last_name: string | null;
  }
  
  interface Order {
    key: number;
    key_ref: string;
    date: string | null; // Changed to allow null date
    distance: number | null;
    expense: string | null;
    income: string | null;
    weight: string;
    status: string;
    payStatus: number | null;
    state_usa: string;
    person: OrderPerson;
    job: number;
  } export default Order;

  export const getOrders = async () => {
    try {
        const response = await apiClient.get("/orders/");
        // console.log("Get orders consumer:", response.data); // Log completo de la respuesta
        const results = response.data?.data?.results || []; // Extraer resultados
        return results; // Devolver solo el array de órdenes
    } catch (error) {
        // console.error("Error fetching orders: ", error);
        throw error; // Lanzar el error para manejarlo en el componente
    }
};
