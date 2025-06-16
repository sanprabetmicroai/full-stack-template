import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/auth'
import Button from '@/components/ui/Button'
import FormItem from '@/components/ui/Form/FormItem'
import { Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Logo from '@/components/template/Logo'
import { toast } from '@/components/ui/toast'
import { Notification } from '@/components/ui/Notification'
import type { SignUpCredential } from '@/@types/auth'

const validationSchema = z.object({
    otp: z
        .string()
        .min(6, { message: 'OTP must be 6 digits' })
        .max(6, { message: 'OTP must be 6 digits' })
        .regex(/^\d{6}$/, { message: 'OTP must be 6 digits' }),
})

type OTPFormSchema = z.infer<typeof validationSchema>

interface LocationState {
    phoneNumber: string
    isSignUp?: boolean
    userData?: SignUpCredential
}

const VerifyOTP = () => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [resendTimer, setResendTimer] = useState<number>(60)
    const [canResend, setCanResend] = useState<boolean>(false)

    const { verifySignIn, verifySignUp, sendOTP } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const state = location.state as LocationState

    // Redirect if no phone number in state
    useEffect(() => {
        if (!state?.phoneNumber) {
            navigate('/sign-in')
        }
    }, [state, navigate])

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1)
            }, 1000)
            return () => clearTimeout(timer)
        } else {
            setCanResend(true)
        }
    }, [resendTimer])

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<OTPFormSchema>({
        defaultValues: {
            otp: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (data: OTPFormSchema) => {
        if (!state?.phoneNumber) return

        setSubmitting(true)
        setError('')

        try {
            let result

            if (state.isSignUp && state.userData) {
                // Sign-up flow
                result = await verifySignUp({
                    phoneNumber: state.phoneNumber,
                    otp: data.otp,
                    userData: state.userData,
                })
            } else {
                // Sign-in flow
                result = await verifySignIn({
                    phoneNumber: state.phoneNumber,
                    otp: data.otp,
                })
            }

            if (result.status === 'success') {
                toast.push(
                    <Notification title="Success" type="success">
                        {result.message}
                    </Notification>,
                )
                // Navigation is handled by AuthProvider redirect
            } else {
                setError(result.message)
            }
        } catch (error) {
            console.error('OTP verification error:', error)
            setError('An unexpected error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    const handleResendOTP = async () => {
        if (!canResend || !state?.phoneNumber) return

        try {
            const result = await sendOTP({ phoneNumber: state.phoneNumber })

            if (result.status === 'success') {
                toast.push(
                    <Notification title="Success" type="success">
                        Verification code sent successfully
                    </Notification>,
                )
                setResendTimer(60)
                setCanResend(false)
                reset()
            } else {
                toast.push(
                    <Notification title="Error" type="danger">
                        {result.message}
                    </Notification>,
                )
            }
        } catch (error) {
            console.error('Resend OTP error:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to resend verification code
                </Notification>,
            )
        }
    }

    if (!state?.phoneNumber) {
        return (
            <div className="mb-8">
                <Logo type="streamline" imgClass="mx-auto" logoWidth={60} />
                <div className="mb-10">
                    <h2 className="mb-2">Invalid Access</h2>
                    <p className="font-semibold heading-text">
                        Please start the authentication process from the
                        beginning.
                    </p>
                </div>
                <Button
                    variant="solid"
                    onClick={() => navigate('/sign-in')}
                    className="w-full"
                >
                    Go to Sign In
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className="mb-8">
                <Logo type="streamline" imgClass="mx-auto" logoWidth={60} />
            </div>
            <div className="mb-10">
                <h2 className="mb-2">Verify Phone Number</h2>
                <p className="font-semibold heading-text">
                    We've sent a 6-digit verification code to
                </p>
                <p className="text-primary-500 font-bold">
                    {state.phoneNumber}
                </p>
            </div>

            {error && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{error}</span>
                </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItem
                    label="Verification Code"
                    invalid={Boolean(errors.otp)}
                    errorMessage={errors.otp?.message}
                >
                    <Controller
                        name="otp"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder="Enter 6-digit code"
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    disabled={isSubmitting}
                >
                    Verify Code
                </Button>
            </Form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                </p>
                <Button
                    variant="plain"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={!canResend}
                    className="text-primary-500"
                >
                    {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                </Button>
            </div>

            <div className="mt-4 text-center">
                <Button
                    variant="plain"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="text-gray-500"
                >
                    ← Back
                </Button>
            </div>
        </>
    )
}

export default VerifyOTP
