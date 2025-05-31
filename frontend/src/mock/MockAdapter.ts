import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

export const mock = new MockAdapter(axiosInstance)

// Export the axios instance for use in ApiService
export default axiosInstance
