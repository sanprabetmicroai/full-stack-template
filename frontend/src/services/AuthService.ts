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
    const response = await api.post<VerifyOTPResponse>(
        '/api/auth/verify-signin',
        data,
    )
    return response as unknown as VerifyOTPResponse
}

// Verify OTP and create account for sign-up (new users)
export const apiVerifySignUp = async (
    data: VerifyOTPCredential & { userData: SignUpCredential },
): Promise<VerifyOTPResponse> => {
    const response = await api.post<VerifyOTPResponse>(
        '/api/auth/verify-signup',
        data,
    )
    return response as unknown as VerifyOTPResponse
}

// Sign out
export const apiSignOut = async (): Promise<SignOutResponse> => {
    return api.post('/api/auth/signout')
}

export const apiSignUp = async (
    data: SignUpCredential,
): Promise<SignUpResponse> => {
    const response = await api.post<SignUpResponse>('/api/auth/signup', data)
    return response as unknown as SignUpResponse
}

export const apiCompleteProfile = async (
    data: Partial<User>,
): Promise<CompleteProfileResponse> => {
    const response = await api.post<CompleteProfileResponse>(
        '/api/auth/complete-profile',
        data,
    )
    return response as unknown as CompleteProfileResponse
}
