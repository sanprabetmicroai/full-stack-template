export interface SignInCredential {
    phoneNumber: string
}

export interface VerifyOTPCredential {
    phoneNumber: string
    otp: string
}

export interface SignUpCredential {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
}

export interface SignInFormSchema {
    phoneNumber: string
    otp?: string
}

export interface SignInResponse extends ApiResponse {
    phoneNumber: string
}

export interface VerifyOTPResponse extends ApiResponse {
    message: string
    profileComplete: boolean
    token?: string
    user: User
}

export interface User {
    id: string
    phoneNumber: string
    firstName?: string
    lastName?: string
    email?: string
    createdAt: string
    dateOfBirth?: string
    timeOfBirth?: string
    locationOfBirth?: string
    authority?: string
    profileImage?: string
}

export interface Token {
    accessToken: string
}

export interface AuthResult {
    status: 'success' | 'failed' | 'incomplete_profile' | 'sign_in_required'
    message: string
    user?: User
}

export interface ApiResponse<T = unknown> {
    message: string
    data?: T
    error?: string
}

export interface SignUpResponse extends ApiResponse {
    user: User
}

export interface CompleteProfileResponse extends ApiResponse {
    message: string
    token: string
    user: User
}

export interface ApiError {
    response?: {
        message?: string
        status?: number
        data?: unknown
        error?: string
    }
    toString(): string
}
