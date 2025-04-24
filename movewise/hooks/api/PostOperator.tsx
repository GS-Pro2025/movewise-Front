import axios from "axios";
import { url } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createIconSetFromFontello } from "@expo/vector-icons";

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

    console.log("Operator Created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("error create operator", error.response?.data || error.message);
    throw error;
  }
};


export const UpdateOperator = async (id: number, formData: FormData) => {
  console.log('opeartor to edit: '+ formData)
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.patch(
      `${url}operators/update/${id}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("error Update operator");
    throw error;
  }
};
