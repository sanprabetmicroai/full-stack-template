import { api } from '../configs/api.config'
import type {
    SignInCredential,
    VerifyOTPCredential,
    SignUpCredential,
    User,
    VerifyOTPResponse,
    CompleteProfileResponse,
    SignInResponse,
} from '@/@types/auth'

export const apiSignIn = async (
    data: SignInCredential,
): Promise<SignInResponse> => {
    return api.post('/api/auth/signin', data)
}

export const apiVerifyOTP = async (
    data: VerifyOTPCredential,
): Promise<VerifyOTPResponse> => {
    const response = await api.post<VerifyOTPResponse>('/api/auth/verify', data)
    return response as unknown as VerifyOTPResponse
}

export const apiSignOut = async () => {
    return api.post('/api/auth/signout')
}

export const apiSignUp = async (data: SignUpCredential) => {
    return api.post('/api/auth/signup', data)
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
