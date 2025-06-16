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

// API Response interfaces matching backend structure
export interface SendOTPResponse {
    success: boolean
    message: string
    data: {
        phoneNumber: string
    }
}

export interface VerifyOTPResponse {
    success: boolean
    message: string
    data: {
        token: string
        user: User
    }
}

export interface SignOutResponse {
    success: boolean
    message: string
}

export interface SignUpResponse {
    success: boolean
    message: string
    data: {
        user: User
    }
}

export interface CompleteProfileResponse {
    success: boolean
    message: string
    data: {
        user: User
    }
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

export interface ApiError {
    response?: {
        message?: string
        status?: number
        data?: unknown
        error?: string
    }
    toString(): string
}

export interface SignUpFormSchema {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    otp?: string
}
