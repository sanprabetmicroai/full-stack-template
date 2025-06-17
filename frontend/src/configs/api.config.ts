import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
if (!baseURL) {
    throw new Error('VITE_API_URL environment variable is not set')
}

console.log('API Base URL:', baseURL)

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request Interceptor:', {
            url: config.url,
            method: config.method,
            hasToken: !!token,
            hasAuthHeader: !!config.headers.Authorization,
            headers: {
                ...config.headers,
                Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : undefined
            }
        });
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Added token to request:', {
                url: config.url,
                hasAuthHeader: !!config.headers.Authorization
            });
        } else {
            console.warn('No token found in localStorage for request:', {
                url: config.url,
                method: config.method
            });
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            hasAuthHeader: !!response.config.headers.Authorization
        });
        return response.data;
    },
    (error) => {
        console.error('API Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            code: error.code,
            hasAuthHeader: !!error.config?.headers?.Authorization
        });
        if (error.response?.status === 401) {
            console.warn('Received 401, clearing token and redirecting to home');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);
