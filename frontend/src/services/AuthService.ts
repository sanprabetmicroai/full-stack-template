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
            identifier: data.identifier,
            identifierType: data.identifierType,
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
export const apiSignOut = async (feedback?: { rating: number; feedback: string }): Promise<SignOutResponse> => {
    try {
        console.log('AuthService: Starting sign out process:', {
            hasFeedback: !!feedback,
            feedbackData: feedback,
            hasToken: !!localStorage.getItem('token')
        });

        const response = await api.post<SignOutResponse>('/api/auth/signout', feedback);
        const responseData = response.data;
        
        console.log('AuthService: Sign out response:', {
            success: responseData.success,
            message: responseData.message
        });

        clearAuthToken();
        return responseData;
    } catch (error: any) {
        console.error('AuthService: Sign out failed:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.config?.headers
        });
        // Clear token even if the request fails
        clearAuthToken();
        throw error;
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

// Request OTP for updating email or phone
export const apiRequestUpdateOTP = async (
    data: { type: 'email' | 'phone'; value: string }
): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const response = await api.post('/api/auth/request-update-otp', data)
        return response.data
    } catch (error) {
        console.error('Request update OTP failed:', error)
        throw error
    }
}

// Verify OTP and update email/phone
export const apiVerifyUpdateOTP = async (
    data: { type: 'email' | 'phone'; value: string; otp: string }
): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const response = await api.post('/api/auth/verify-update-otp', data)
        return response.data
    } catch (error) {
        console.error('Verify update OTP failed:', error)
        throw error
    }
}

// Check resend status for OTP
export const apiCheckResendStatus = async (
    data: { identifier: string; identifierType: 'email' | 'phone'; tag: string }
): Promise<{ success: boolean; data: { allowed: boolean; timeRemaining: number } }> => {
    try {
        const response = await api.post('/api/auth/check-resend-status', data)
        return response.data
    } catch (error) {
        console.error('Check resend status failed:', error)
        throw error
    }
}
