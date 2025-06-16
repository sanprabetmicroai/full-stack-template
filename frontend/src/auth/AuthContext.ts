import { createContext } from 'react'
import type { AuthResult, User, SignUpCredential } from '@/@types/auth'

export interface Auth {
    authenticated: boolean
    user: User
    sendOTP: (values: { phoneNumber: string }) => Promise<AuthResult>
    verifySignIn: (values: {
        phoneNumber: string
        otp: string
    }) => Promise<AuthResult>
    verifySignUp: (values: {
        phoneNumber: string
        otp: string
        userData: SignUpCredential
    }) => Promise<AuthResult>
    signOut: () => Promise<void>
    updateUser: (userData: Partial<User>) => void
}

const defaultFunctionPlaceHolder = async () => ({
    status: 'failed' as const,
    message: 'Not implemented',
})

const AuthContext = createContext<Auth>({
    authenticated: false,
    user: { id: '', phoneNumber: '', createdAt: '' },
    sendOTP: async () => defaultFunctionPlaceHolder(),
    verifySignIn: async () => defaultFunctionPlaceHolder(),
    verifySignUp: async () => defaultFunctionPlaceHolder(),
    signOut: async () => {},
    updateUser: () => {},
})

export default AuthContext
