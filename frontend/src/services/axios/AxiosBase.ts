import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const AxiosBase = (config: AxiosRequestConfig) => {
    const axiosInstance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
        ...config,
    })

    // Add request interceptor for authentication
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    // Add response interceptor for error handling
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Handle unauthorized access
                localStorage.removeItem('token')
                window.location.href = '/sign-in'
            }
            return Promise.reject(error)
        }
    )

    return axiosInstance(config)
}

export default AxiosBase
