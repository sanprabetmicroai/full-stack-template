import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Request interceptor for logging
axios.interceptors.request.use(
    (config) => {
        console.log('=== API Request ===')
        console.log('URL:', `${config.baseURL}${config.url}`)
        console.log('Method:', config.method?.toUpperCase())
        console.log('Headers:', {
            ...config.headers,
            Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : undefined
        })
        console.log('Data:', config.data)
        return config
    },
    (error) => {
        console.error('Request Error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor for logging
axios.interceptors.response.use(
    (response) => {
        console.log('=== API Response ===')
        console.log('Status:', response.status)
        console.log('Headers:', response.headers)
        console.log('Data:', response.data)
        return response
    },
    (error: AxiosError) => {
        console.error('=== API Error ===')
        console.error('Status:', error.response?.status)
        console.error('Status Text:', error.response?.statusText)
        console.error('Error Message:', error.message)
        console.error('Response Data:', error.response?.data)
        console.error('Request Config:', {
            url: error.config?.url,
            method: error.config?.method,
            headers: {
                ...error.config?.headers,
                Authorization: error.config?.headers?.Authorization ? 'Bearer [REDACTED]' : undefined
            }
        })
        return Promise.reject(error)
    }
)

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

const ApiService = {
    fetchDataWithAxios<Response = unknown, Request = unknown>(
        param: AxiosRequestConfig<Request>,
    ) {
        const requestId = Math.random().toString(36).substring(7)
        console.log(`[${requestId}] Starting API request...`)

        return new Promise<Response>((resolve, reject) => {
            axiosInstance(param)
                .then((response: AxiosResponse<Response>) => {
                    console.log(`[${requestId}] Request completed successfully`)
                    resolve(response.data)
                })
                .catch((error: AxiosError) => {
                    console.error(`[${requestId}] Request failed:`, {
                        status: error.response?.status,
                        message: error.message,
                        data: error.response?.data
                    })
                    
                    // Enhanced error object with more details
                    const enhancedError = {
                        ...error,
                        requestId,
                        timestamp: new Date().toISOString(),
                        requestDetails: {
                            url: param.url,
                            method: param.method,
                            headers: {
                                ...param.headers,
                                Authorization: param.headers?.Authorization ? 'Bearer [REDACTED]' : undefined
                            }
                        }
                    }
                    
                    reject(enhancedError)
                })
        })
    },
}

export default ApiService
