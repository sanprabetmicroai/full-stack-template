export interface SignInCredential {
    identifier: string
    identifierType?: 'phone' | 'email'
    tag: 'signup' | 'login' | 'update_phone' | 'update_email'
}

export interface VerifyOTPCredential {
    identifier: string
    identifierType?: 'phone' | 'email'
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
        identifier: string
        identifierType: 'phone' | 'email'
        tag: string
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

export interface Timestamp {
    _seconds: number
    _nanoseconds: number
}

export interface User {
    id: string
    phoneNumber: string
    firstName?: string
    lastName?: string
    email?: string
    email_verified?: boolean // Only set to true when email is verified through OTP update
    phone_verified?: boolean // Only set to true when phone is verified through OTP update
    createdAt: Timestamp
    dateOfBirth?: string
    timeOfBirth?: string
    locationOfBirth?: string
    authority?: string
    profileImage?: string
    lastSignIn?: Timestamp
    isActive?: boolean
    signInCount?: number
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
