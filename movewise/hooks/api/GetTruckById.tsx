import { url } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const getTruckById = async (truck_id: number) => {
    try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await axios.get(url + "truck-by-id/" + truck_id, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status === 404) {
            return {
                sms: "truck not found"
            }
        }
        console.log('truck', response.data)
        return response.data;
    } catch {
        return null;
    }
};
