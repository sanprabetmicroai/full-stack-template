import { createContext } from 'react'
import type { AuthResult, User } from '@/@types/auth'

export interface Auth {
    authenticated: boolean
    user: User
    signIn: (values: { phoneNumber: string }) => Promise<AuthResult>
    verifyOTP: (values: {
        phoneNumber: string
        otp: string
    }) => Promise<AuthResult>
    signUp: (values: {
        firstName: string
        lastName: string
        email: string
        phoneNumber: string
    }) => Promise<AuthResult>
    signOut: () => Promise<void>
    updateUser: (userData: Partial<User>) => void
    completeProfile: (userData: Partial<User>) => Promise<AuthResult>
}

const defaultFunctionPlaceHolder = async () => ({
    status: 'failed' as const,
    message: 'Not implemented',
})

const AuthContext = createContext<Auth>({
    authenticated: false,
    user: { id: '', phoneNumber: '', createdAt: '' },
    signIn: defaultFunctionPlaceHolder,
    verifyOTP: defaultFunctionPlaceHolder,
    signUp: defaultFunctionPlaceHolder,
    signOut: async () => {},
    updateUser: () => {},
    completeProfile: async () => ({
        status: 'failed',
        message: 'Not implemented',
    }),
})

export default AuthContext
