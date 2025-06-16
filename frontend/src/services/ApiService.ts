import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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
        console.log('API Request:', {
            url: param.url,
            method: param.method,
            data: param.data,
            headers: param.headers,
        })

        return new Promise<Response>((resolve, reject) => {
            axiosInstance(param)
                .then((response: AxiosResponse<Response>) => {
                    console.log('API Response:', {
                        status: response.status,
                        data: response.data,
                    })
                    resolve(response.data)
                })
                .catch((errors: AxiosError) => {
                    console.error('API Error:', {
                        message: errors.message,
                        response: errors.response?.data,
                        status: errors.response?.status,
                    })
                    reject(errors)
                })
        })
    },
}

export default ApiService
