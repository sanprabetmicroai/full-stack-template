import type { ApiError } from '@/@types/auth'

export const handleApiError = (error: unknown): string => {
    const apiError = error as ApiError
    if (apiError?.response?.message) {
        return apiError.response.message
    }
    if (apiError?.response?.error) {
        return apiError.response.error
    }
    return 'An unexpected error occurred'
}

export const isNetworkError = (error: unknown): boolean => {
    const apiError = error as ApiError
    return !apiError?.response
}

export const getErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
        return 'Network error. Please check your connection.'
    }
    return handleApiError(error)
}
