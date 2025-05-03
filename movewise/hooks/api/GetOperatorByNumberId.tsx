import apiClient from "./apiClient";

<<<<<<< HEAD
export const getOperatorByNumberId = async (number_id: string) => {
    try {
=======
export const getOperatorByNumberId = async (number_id: number) => {
    try { 
>>>>>>> 07cabdeb3e66b15e1a0c9d2cbf24029626481d65
        const response = await apiClient.get("/operators/" + number_id);
        if (response.status === 404) {
            return {
                error: "operator not found"
            }
        }
        console.log(response.data)
        return response.data;
    } catch {
        return null;
    }
};
