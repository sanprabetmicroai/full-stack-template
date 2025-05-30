import { useRef, useImperativeHandle, useState } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignOut, apiVerifyOTP } from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
import type {
    SignInCredential,
    VerifyOTPCredential,
    AuthResult,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router'

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
    const signedIn = useSessionUser((state) => state.session.signedIn)
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
        setUser({ phoneNumber: '', createdAt: '' })
        setSessionSignedIn(false)
    }

    const signIn = async (values: SignInCredential): Promise<AuthResult> => {
        try {
            console.log(
                'AuthProvider: Initiating sign in request with:',
                values,
            )
            const resp = await apiSignIn(values)
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
        } catch (errors: any) {
            console.error('AuthProvider: Sign in error:', {
                message: errors?.response?.data?.message,
                status: errors?.response?.status,
                data: errors?.response?.data,
                error: errors,
            })
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
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
        } catch (errors: any) {
            console.error('AuthProvider: OTP verification error:', {
                message: errors?.response?.data?.message,
                status: errors?.response?.status,
                data: errors?.response?.data,
                error: errors,
            })
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
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

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                verifyOTP,
                signOut,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
