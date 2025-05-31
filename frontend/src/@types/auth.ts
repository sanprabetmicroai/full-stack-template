export interface SignInCredential {
    phoneNumber: string;
}

export interface VerifyOTPCredential {
    phoneNumber: string;
    otp: string;
}

export interface SignInFormSchema {
    phoneNumber: string;
    otp?: string;
}

export interface SignInResponse {
    message: string;
    phoneNumber: string;
}

export interface VerifyOTPResponse {
    message: string;
    token: string;
    user: User;
}

export interface User {
    phoneNumber: string;
    createdAt: string;
    name?: string;
    dateOfBirth?: string;
    timeOfBirth?: string;
    locationOfBirth?: string;
    language?: string;
}

export interface Token {
    accessToken: string;
}

export interface AuthResult {
    status: 'success' | 'failed';
    message: string;
}

export type OauthSignInCallbackPayload = {
    onSignIn: (token: Token, user?: User) => void
    redirect: () => void
}
