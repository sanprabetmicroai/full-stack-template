import { api } from '@/configs/api'

export const apiGetCurrentUser = async () => {
    try {
        const response = await api.get('/users/me')
        return {
            success: true,
            data: response.data,
        }
    } catch (error) {
        return {
            success: false,
            error,
        }
    }
}
