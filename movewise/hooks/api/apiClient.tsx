import axios, { AxiosInstance } from "axios";

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25faWQiOjIsImVtYWlsIjoibWFyaWFAZXhhbXBsZS5jb20iLCJleHAiOjE3NDM4NzE0MzMsImlhdCI6MTc0Mzc4NTAzM30.nY6xwo5BAIA7ncSz1l7-8hCkv_R0eKfhgCVE2BYIuxQ';

export interface ApiError {
  status: number;
  message: string;
  isAuthError?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  timeout: 10000,
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Log the timestamp of the request
    console.log('Request Time:', new Date().toISOString());
    // Log the token being used (last 4 chars only for security)
    const tokenPreview = config.headers?.Authorization ? 
      `...${config.headers.Authorization.slice(-4)}` : 'No token';
    console.log('Token:', tokenPreview);
    console.log('=== API Request ===');
    console.log('Full URL:', config.baseURL ?? '' + config.url ?? '');
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', JSON.stringify(config.headers, null, 2));
    if (config.data) {
      console.log('Data:', JSON.stringify(config.data, null, 2));
    }
    console.log('================');
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject({
      status: 500,
      message: 'Error making the request',
    } as ApiError);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Detailed logging of the response
    console.log('=== API Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('==================');
    return response;
  },
  (error) => {
    console.error('=== API Error ===');
    console.error('Message:', error.message);

    let apiError: ApiError = {
      status: 500,
      message: 'Unexpected server error',
    };

    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          apiError = {
            status: 401,
            message: 'Your session has expired. Please login again.',
            isAuthError: true
          };
          // Here you can add additional logic like:
          // - Clear current token
          // - Redirect user to login
          // - Try to refresh token
          break;
        case 403:
          apiError = {
            status: 403,
            message: 'You do not have permission to perform this action',
            isAuthError: true
          };
          break;
        case 404:
          apiError = {
            status: 404,
            message: 'The requested resource was not found'
          };
          break;
        case 422:
          apiError = {
            status: 422,
            message: 'Invalid request data'
          };
          break;
        default:
          apiError = {
            status: status,
            message: error.response.data?.message || 'Request error'
          };
      }

      console.error('Status:', status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      apiError = {
        status: 0,
        message: 'Could not connect to the server. Please check your internet connection.'
      };
      console.error('No response received from server');
      console.error('Request:', error.request);
    }

    console.error('================');
    return Promise.reject(apiError);
  }
);

export default apiClient;