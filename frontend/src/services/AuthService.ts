import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    SignInCredential,
    VerifyOTPCredential,
    SignInResponse,
    VerifyOTPResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchDataWithAxios<SignInResponse, SignInCredential>({
        url: endpointConfig.signIn,
        method: 'post',
        data,
    })
}

export async function apiVerifyOTP(data: VerifyOTPCredential) {
    return ApiService.fetchDataWithAxios<VerifyOTPResponse, VerifyOTPCredential>({
        url: endpointConfig.verifyOTP,
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signOut,
        method: 'post',
    })
}
