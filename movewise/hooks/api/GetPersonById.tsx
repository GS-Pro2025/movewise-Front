import apiClient from "./apiClient";

export const GetPersonById = async (person_id: number) => {
    try {
        const response = await apiClient.get(`/person/${person_id}/`);
        if (response.status === 404) {
            return {
                error: "person not found"
            }
        }
        return response.data;
    } catch (e) {
        console.error(`error to get person ${e}`);
    }
}