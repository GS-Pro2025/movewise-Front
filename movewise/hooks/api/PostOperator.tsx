import axios from "axios";
import { url } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createIconSetFromFontello } from "@expo/vector-icons";

export const PostOperator = async (formData: FormData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Token not found");
    console.log(`ruta de envio operador: ${url}/operators/create/`);
    console.log(`info enviada como cuerpo: ${JSON.stringify(formData)}`);
    
    
    const response = await axios.post(`${url}/operators/create/`, formData, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Operator Created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating operator:", error.response?.data || error.message);
    
    // Handle different types of errors
    if (error.response) {
      const errorData = error.response.data;
      console.log('Full error response:', errorData);

      // Handle validation errors
      if (errorData.errors) {
        let errorMessage = 'Validation Errors:\n';
        
        // If errors is an object with field errors
        if (typeof errorData.errors === 'object') {
          Object.entries(errorData.errors).forEach(([field, message]) => {
            errorMessage += `• ${field}: ${message}\n`;
          });
        } 
        // If errors is an array of error messages
        else if (Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error: any) => {
            if (typeof error === 'object') {
              Object.entries(error).forEach(([field, message]) => {
                errorMessage += `• ${field}: ${message}\n`;
              });
            } else {
              errorMessage += `• ${error}\n`;
            }
          });
        }
        
        throw new Error(errorMessage);
      }
      
      // Handle other types of error responses
      if (typeof errorData === 'object') {
        let errorMessage = '';
        Object.entries(errorData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            errorMessage += `${key}: ${value.join(', ')}\n`;
          } else if (typeof value === 'object' && value !== null) {
            errorMessage += `${key}: ${JSON.stringify(value)}\n`;
          } else {
            errorMessage += `${key}: ${value}\n`;
          }
        });
        throw new Error(errorMessage.trim());
      }

      throw new Error(errorData.toString());
    } else if (error.request) {
      throw new Error('No response received from server. Please try again.');
    } else {
      throw new Error('Error creating operator: ' + error.message);
    }
  }
};


export const UpdateOperator = async (id: number, formData: FormData) => {
  console.log('opeartor to edit: '+ formData)
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Token not found");

    const response = await axios.patch(
      `${url}/operators/update/${id}/`,
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
