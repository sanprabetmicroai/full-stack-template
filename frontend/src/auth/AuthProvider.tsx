import { useRef, useImperativeHandle, useState, forwardRef } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import {
    apiSendOTP,
    apiSignOut,
    apiVerifySignIn,
    apiVerifySignUp,
} from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import type {
    SignInCredential,
    VerifyOTPCredential,
    AuthResult,
    User,
    Token,
    SignUpCredential,
} from '@/@types/auth'
import type { ReactNode } from 'react'
import type { NavigateFunction } from 'react-router-dom'

interface ApiErrorResponse {
    message?: string
    status?: number
    data?: {
        error?: string
        message?: string
    }
    error?: string
}

interface ApiError {
    response?: ApiErrorResponse
    toString(): string
}

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = forwardRef<IsolatedNavigatorRef>((_, ref) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
})

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const { token, setToken } = useToken()
    const [tokenState, setTokenState] = useState(token)

    console.log('AuthProvider State:', {
        signedIn,
        hasUser: !!user?.id,
        hasToken: !!token,
        hasTokenState: !!tokenState,
        authenticated: Boolean(tokenState && signedIn),
    })

    const authenticated = Boolean(tokenState && signedIn)

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const handleSignIn = (tokens: Token, user?: User) => {
        console.log('Handling sign in:', {
            hasToken: !!tokens.accessToken,
            hasUser: !!user,
            tokenLength: tokens.accessToken.length,
        })
        setToken(tokens.accessToken)
        setTokenState(tokens.accessToken)
        setSessionSignedIn(true)

        if (user) {
            setUser(user)
        }
    }

    const handleSignOut = () => {
        console.log('Handling sign out')
        setToken('')
        setUser({
            id: '',
            phoneNumber: '',
            createdAt: '',
        })
        setSessionSignedIn(false)
    }

    // Send OTP (for both sign-in and sign-up)
    const sendOTP = async (values: SignInCredential): Promise<AuthResult> => {
        try {
            console.log('AuthProvider: Sending OTP to:', values.phoneNumber)
            const resp = await apiSendOTP(values)
            console.log('AuthProvider: Send OTP response:', resp)

            if (resp?.success) {
                return {
                    status: 'success',
                    message: resp.message,
                }
            }

            return {
                status: 'failed',
                message: resp?.message || 'Failed to send verification code',
            }
        } catch (errors: unknown) {
            const apiError = errors as ApiError
            console.error('AuthProvider: Send OTP error:', apiError)

            const errorMessage =
                apiError?.response?.data?.message ||
                apiError?.response?.message ||
                'Failed to send verification code'

            return {
                status: 'failed',
                message: errorMessage,
            }
        }
    }

    // Verify OTP for existing users (sign-in)
    const verifySignIn = async (
        values: VerifyOTPCredential,
    ): Promise<AuthResult> => {
        try {
            console.log(
                'AuthProvider: Verifying sign-in OTP for:',
                values.phoneNumber,
            )
            const resp = await apiVerifySignIn(values)
            console.log('AuthProvider: Verify sign-in response:', resp)

            if (resp?.success && resp.data?.token) {
                handleSignIn({ accessToken: resp.data.token }, resp.data.user)
                redirect()
                return {
                    status: 'success',
                    message: resp.message,
                }
            }

            return {
                status: 'failed',
                message: resp?.message || 'Failed to verify code',
            }
        } catch (errors: unknown) {
            const apiError = errors as ApiError
            console.error('AuthProvider: Verify sign-in error:', apiError)

            const errorMessage =
                apiError?.response?.data?.message ||
                apiError?.response?.message ||
                'Failed to verify code'

            return {
                status: 'failed',
                message: errorMessage,
            }
        }
    }

    // Verify OTP for new users (sign-up)
    const verifySignUp = async (values: {
        phoneNumber: string
        otp: string
        userData: SignUpCredential
    }): Promise<AuthResult> => {
        try {
            console.log(
                'AuthProvider: Verifying sign-up OTP for:',
                values.phoneNumber,
            )
            const resp = await apiVerifySignUp(values)
            console.log('AuthProvider: Verify sign-up response:', resp)

            if (resp?.success && resp.data?.token) {
                handleSignIn({ accessToken: resp.data.token }, resp.data.user)
                redirect()
                return {
                    status: 'success',
                    message: resp.message,
                }
            }

            return {
                status: 'failed',
                message: resp?.message || 'Failed to create account',
            }
        } catch (errors: unknown) {
            const apiError = errors as ApiError
            console.error('AuthProvider: Verify sign-up error:', apiError)

            const errorMessage =
                apiError?.response?.data?.message ||
                apiError?.response?.message ||
                'Failed to create account'

            return {
                status: 'failed',
                message: errorMessage,
            }
        }
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } finally {
            handleSignOut()
            navigatorRef.current?.navigate('/')
        }
    }

    const updateUser = async (userData: Partial<User>) => {
        setUser({ ...user, ...userData })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                sendOTP,
                verifySignIn,
                verifySignUp,
                signOut,
                updateUser,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
