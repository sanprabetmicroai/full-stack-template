import { createContext } from 'react'
import type { AuthResult, User, SignUpCredential, SignInCredential, VerifyOTPCredential } from '@/@types/auth'

export interface Auth {
    authenticated: boolean
    user: User
    sendOTP: (values: SignInCredential) => Promise<AuthResult>
    verifySignIn: (values: VerifyOTPCredential) => Promise<AuthResult>
    verifySignUp: (values: {
        identifier: string
        identifierType?: 'phone' | 'email'
        otp: string
        userData: SignUpCredential
    }) => Promise<AuthResult>
    signOut: (feedback?: { rating: number; feedback: string }) => Promise<void>
    updateUser: (userData: Partial<User>) => void
}

const defaultFunctionPlaceHolder = () => {
    throw new Error('Function not implemented')
}

const AuthContext = createContext<Auth>({
    authenticated: false,
    user: { 
        id: '', 
        phoneNumber: '', 
        createdAt: { _seconds: 0, _nanoseconds: 0 } 
    },
    sendOTP: async () => defaultFunctionPlaceHolder(),
    verifySignIn: async () => defaultFunctionPlaceHolder(),
    verifySignUp: async () => defaultFunctionPlaceHolder(),
    signOut: async () => {},
    updateUser: () => {},
})

export default AuthContext
