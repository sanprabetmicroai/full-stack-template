import { api } from '../configs/api.config'
import type {
    SignInCredential,
    VerifyOTPCredential,
    SignUpCredential,
    User,
    SendOTPResponse,
    VerifyOTPResponse,
    SignOutResponse,
    SignUpResponse,
    CompleteProfileResponse,
} from '@/@types/auth'

// Helper function to store auth token
const storeAuthToken = (token: string) => {
    console.log('Storing auth token:', { tokenLength: token.length });
    localStorage.setItem('token', token)
    // Update axios default headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    console.log('Updated axios headers:', { 
        hasAuthHeader: !!api.defaults.headers.common['Authorization'],
        headerValue: api.defaults.headers.common['Authorization'] ? 'Bearer [REDACTED]' : undefined
    });
}

// Helper function to clear auth token
const clearAuthToken = () => {
    console.log('Clearing auth token');
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    console.log('Cleared axios headers:', { 
        hasAuthHeader: !!api.defaults.headers.common['Authorization']
    });
}

// Send OTP for both sign-in and sign-up
export const apiSendOTP = async (
    data: SignInCredential,
): Promise<SendOTPResponse> => {
    return api.post('/api/auth/send-otp', data)
}

// Verify OTP for sign-in (existing users)
export const apiVerifySignIn = async (
    data: VerifyOTPCredential,
): Promise<VerifyOTPResponse> => {
    try {
        console.log('AuthService: Verifying sign-in with data:', { 
            phoneNumber: data.phoneNumber,
            otpLength: data.otp.length 
        })
        const response = await api.post<VerifyOTPResponse>(
            '/api/auth/verify-signin',
            data,
        )
        const responseData = response as unknown as VerifyOTPResponse
        console.log('AuthService: Response data:', responseData)
        console.log('AuthService: Response data structure:', {
            hasSuccess: 'success' in responseData,
            hasMessage: 'message' in responseData,
            hasData: 'data' in responseData,
            dataKeys: responseData.data ? Object.keys(responseData.data) : [],
            fullResponse: responseData
        })
        if (responseData.data?.token) {
            storeAuthToken(responseData.data.token)
        }
        return responseData
    } catch (error: any) {
        console.error('AuthService: Sign in verification failed:', {
            error,
            response: error.response?.data,
            status: error.response?.status
        })
        throw error
    }
}

// Verify OTP and create account for sign-up (new users)
export const apiVerifySignUp = async (
    data: VerifyOTPCredential & { userData: SignUpCredential },
): Promise<VerifyOTPResponse> => {
    try {
        const response = await api.post<VerifyOTPResponse>(
            '/api/auth/verify-signup',
            data,
        )
        const { data: responseData } = response
        if (responseData.data?.token) {
            storeAuthToken(responseData.data.token)
        }
        return responseData
    } catch (error) {
        console.error('Sign up verification failed:', error)
        throw error
    }
}

// Sign out
export const apiSignOut = async (): Promise<SignOutResponse> => {
    try {
        const response = await api.post<SignOutResponse>('/api/auth/signout')
        clearAuthToken()
        return response.data
    } catch (error) {
        console.error('Sign out failed:', error)
        // Clear token even if the request fails
        clearAuthToken()
        throw error
    }
}

export const apiSignUp = async (
    data: SignUpCredential,
): Promise<SignUpResponse> => {
    try {
        const response = await api.post<SignUpResponse>('/api/auth/signup', data)
        return response.data
    } catch (error) {
        console.error('Sign up failed:', error)
        throw error
    }
}

export const apiCompleteProfile = async (
    data: Partial<User>,
): Promise<CompleteProfileResponse> => {
    try {
        const response = await api.post<CompleteProfileResponse>(
            '/api/auth/complete-profile',
            data,
        )
        return response.data
    } catch (error) {
        console.error('Complete profile failed:', error)
        throw error
    }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token')
}

// Get stored token
export const getAuthToken = (): string | null => {
    return localStorage.getItem('token')
}
