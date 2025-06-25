import apiClient from "./apiClient";

export const ListOperatorsAndFreelances = async (page = 1) => {
    try {
        const response = await apiClient.get('/list-operators-active-freelance/', {
            params: {
                page: page
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('API Error Details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params,
            responseData: error.response?.data
        });

        // Re-throw the error with more context
        const apiError = new Error(error.message || 'Failed to fetch operators');
        (apiError as any).response = error.response;
        (apiError as any).config = error.config;
        throw apiError;
    }
};