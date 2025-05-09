import apiClient from "./apiClient";

export const forgotPassword = async (email: string) => {
    try {
        const response = await apiClient.post("user/forgot-password/", { email });
        console.log("Forgot password response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        throw error;
    }
}