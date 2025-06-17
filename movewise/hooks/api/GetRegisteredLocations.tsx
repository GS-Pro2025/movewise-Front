import apiClient from "./apiClient";

export const getRegisteredLocations = async () => {
  try {
    const response = await apiClient.get("/orders-registered-locations/");
    // console.log("get registered locations", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching registered locations:", error);
    throw error;
  }
};
