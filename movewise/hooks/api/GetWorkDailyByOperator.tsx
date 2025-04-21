import apiClient from "./apiClient";

export const getWorkDailyByOperator = async (operatorId: string) => {
    const response = await apiClient.get(`/assigns/operator/${operatorId}`);
    return response.data;
};

