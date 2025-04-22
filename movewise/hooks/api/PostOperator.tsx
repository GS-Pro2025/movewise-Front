import axios from "axios";
import { url } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const PostOperator = async (formData: FormData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Token not found");

    const response = await axios.post(`${url}operators/create/`, formData, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Operador creado:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error al crear operador:", error.response?.data || error.message);
    throw error;
  }
};
