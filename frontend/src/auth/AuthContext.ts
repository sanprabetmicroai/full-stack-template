import { createContext } from 'react'
import type {
    SignInCredential,
    VerifyOTPCredential,
    AuthResult,
    User,
} from '@/@types/auth'

type Auth = {
    authenticated: boolean
    user: User
    signIn: (values: SignInCredential) => Promise<AuthResult>
    verifyOTP: (values: VerifyOTPCredential) => Promise<AuthResult>
    signOut: () => void
    updateUser: (user: Partial<User>) => Promise<void>
}

const defaultFunctionPlaceHolder = async () => {
    return {
        status: 'failed' as const,
        message: 'Function not implemented',
    }
}

const AuthContext = createContext<Auth>({
    authenticated: false,
    user: { phoneNumber: '', createdAt: '' },
    signIn: defaultFunctionPlaceHolder,
    verifyOTP: defaultFunctionPlaceHolder,
    signOut: () => {},
    updateUser: async () => {},
})

export default AuthContext
