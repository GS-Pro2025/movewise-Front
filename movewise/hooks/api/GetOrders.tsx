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
    try{
        const response = await apiClient.get("/orders");
        console.log(response.data)
        const data = response.data;

        // Extract the `results` array from the paginated response
        return data.results || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};
