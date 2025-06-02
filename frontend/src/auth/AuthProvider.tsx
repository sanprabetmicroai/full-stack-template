import { useRef, useImperativeHandle, useState } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import {
    apiSignIn,
    apiSignOut,
    apiVerifyOTP,
    apiSignUp,
    apiCompleteProfile,
} from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
import type {
    SignInCredential,
    VerifyOTPCredential,
    AuthResult,
    User,
    Token,
    SignUpCredential,
    SignInResponse,
} from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router'

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

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
}

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const { token, setToken } = useToken()
    const [tokenState, setTokenState] = useState(token)

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
        setToken(tokens.accessToken)
        setTokenState(tokens.accessToken)
        setSessionSignedIn(true)

        if (user) {
            setUser(user)
        }
    }

    const handleSignOut = () => {
        setToken('')
        setUser({
            id: '',
            phoneNumber: '',
            createdAt: '',
        })
        setSessionSignedIn(false)
    }

    const signIn = async (values: SignInCredential): Promise<AuthResult> => {
        try {
            console.log(
                'AuthProvider: Initiating sign in request with:',
                values,
            )
            const resp: SignInResponse = await apiSignIn(values)
            console.log('AuthProvider: Sign in API response:', resp)

            if (resp) {
                return {
                    status: 'success',
                    message: resp.message,
                }
            }
            console.error('AuthProvider: No response received from sign in API')
            return {
                status: 'failed',
                message: 'Unable to send OTP',
            }
        } catch (errors: unknown) {
            const apiError = errors as ApiError
            console.error('AuthProvider: Sign in error:', {
                message: apiError?.response?.message,
                status: apiError?.response?.status,
                data: apiError?.response?.data,
                error: apiError,
            })
            return {
                status: 'failed',
                message: apiError?.response?.message || apiError.toString(),
            }
        }
    }

    const verifyOTP = async (
        values: VerifyOTPCredential,
    ): Promise<AuthResult> => {
        try {
            console.log(
                'AuthProvider: Initiating OTP verification with:',
                values,
            )
            const resp = await apiVerifyOTP(values)
            console.log('AuthProvider: OTP verification API response:', resp)

            if (resp) {
                console.log(
                    'AuthProvider: OTP verification successful, handling sign in',
                )
                if (!resp.profileComplete) {
                    return {
                        status: 'incomplete_profile',
                        message: 'Please complete your profile',
                        user: resp.user,
                    }
                }
                if (!resp.token) {
                    return {
                        status: 'failed',
                        message: 'No token received',
                    }
                }
                handleSignIn({ accessToken: resp.token }, resp.user)
                redirect()
                return {
                    status: 'success',
                    message: resp.message,
                }
            }
            console.error(
                'AuthProvider: No response received from OTP verification API',
            )
            return {
                status: 'failed',
                message: 'Unable to verify OTP',
            }
        } catch (errors: unknown) {
            const apiError = errors as ApiError
            console.error('AuthProvider: OTP verification error:', {
                message: apiError?.response?.message,
                status: apiError?.response?.status,
                data: apiError?.response?.data,
                error: apiError,
            })
            return {
                status: 'failed',
                message: apiError?.response?.message || apiError.toString(),
            }
        }
    }

    const completeProfile = async (
        userData: Partial<User>,
    ): Promise<AuthResult> => {
        try {
            console.log('AuthProvider: Completing user profile:', userData)
            const resp = await apiCompleteProfile(userData)
            console.log('AuthProvider: Profile completion API response:', resp)

            if (resp) {
                handleSignIn({ accessToken: resp.token }, resp.user)
                redirect()
                return {
                    status: 'success',
                    message: resp.message,
                }
            }
            return {
                status: 'failed',
                message: 'Unable to complete profile',
            }
        } catch (errors: unknown) {
            const apiError = errors as ApiError
            console.error('AuthProvider: Profile completion error:', {
                message: apiError?.response?.message,
                status: apiError?.response?.status,
                data: apiError?.response?.data,
                error: apiError,
            })
            return {
                status: 'failed',
                message: apiError?.response?.message || apiError.toString(),
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

    const signUp = async (values: SignUpCredential): Promise<AuthResult> => {
        try {
            console.log(
                'AuthProvider: Initiating sign up request with:',
                values,
            )
            const resp = (await apiSignUp(values)) as unknown as {
                message: string
                user: User
            }
            console.log('AuthProvider: Sign up API response:', resp)

            if (resp) {
                return {
                    status: 'sign_in_required',
                    message:
                        'Account created successfully! Please sign in to continue.',
                }
            }
            console.error('AuthProvider: No response received from sign up API')
            return {
                status: 'failed',
                message: 'Unable to create account',
            }
        } catch (errors: unknown) {
            const apiError = errors as ApiError
            console.error('AuthProvider: Sign up error:', {
                message:
                    apiError?.response?.data?.error ||
                    apiError?.response?.data?.message,
                status: apiError?.response?.status,
                data: apiError?.response?.data,
                error: apiError,
            })

            // Handle specific error cases
            if (apiError?.response?.status === 400) {
                const errorData = apiError.response.data as { error: string }
                if (errorData.error === 'User already exists') {
                    return {
                        status: 'failed',
                        message:
                            'An account with this email or phone number already exists. Please sign in instead.',
                    }
                }
            }

            return {
                status: 'failed',
                message:
                    apiError?.response?.data?.error ||
                    apiError?.response?.data?.message ||
                    'An error occurred during sign up',
            }
        }
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                verifyOTP,
                signUp,
                signOut,
                updateUser,
                completeProfile,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
