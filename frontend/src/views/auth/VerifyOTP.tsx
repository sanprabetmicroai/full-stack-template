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
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation()

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

    const validationSchema = z.object({
        otp: z
            .string()
            .min(6, { message: t('auth.validation.otpRequired') })
            .max(6, { message: t('auth.validation.otpRequired') })
            .regex(/^\d{6}$/, { message: t('auth.validation.otpInvalid') }),
    })

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm({
        defaultValues: {
            otp: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (data: any) => {
        if (!state?.phoneNumber) return

        setSubmitting(true)
        setError('')

        try {
            let result

            if (state.isSignUp && state.userData) {
                // Sign-up flow
                result = await verifySignUp({
                    identifier: state.phoneNumber,
                    identifierType: 'phone',
                    otp: data.otp,
                    userData: state.userData,
                })
            } else {
                // Sign-in flow
                result = await verifySignIn({
                    identifier: state.phoneNumber,
                    identifierType: 'phone',
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
            setError(t('auth.signIn.unexpectedError'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleResendOTP = async () => {
        if (!canResend || !state?.phoneNumber) return

        try {
            const result = await sendOTP({
                identifier: state.phoneNumber,
                identifierType: 'phone',
                tag: state.isSignUp ? 'signup' : 'login',
            })

            if (result.status === 'success') {
                toast.push(
                    <Notification title="Success" type="success">
                        {t('auth.verifyOTP.verificationSent')}
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
                    {t('auth.verifyOTP.resendError')}
                </Notification>,
            )
        }
    }

    if (!state?.phoneNumber) {
        return (
            <div className="mb-8">
                <Logo type="streamline" imgClass="mx-auto" logoWidth={60} />
                <div className="mb-10">
                    <h2 className="mb-2">
                        {t('auth.verifyOTP.invalidAccess')}
                    </h2>
                    <p className="font-semibold heading-text">
                        {t('auth.verifyOTP.invalidAccessMessage')}
                    </p>
                </div>
                <Button
                    variant="solid"
                    onClick={() => navigate('/sign-in')}
                    className="w-full"
                >
                    {t('auth.verifyOTP.goToSignIn')}
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
                <h2 className="mb-2">{t('auth.verifyOTP.title')}</h2>
                <p className="font-semibold heading-text">
                    {t('auth.verifyOTP.subtitle')}
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
                    label=""
                    invalid={Boolean(errors.otp)}
                    errorMessage={errors.otp?.message}
                >
                    <Controller
                        name="otp"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder={t('auth.verifyOTP.otpPlaceholder')}
                                maxLength={6}
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
                    {t('auth.verifyOTP.verify')}
                </Button>
            </Form>

            <div className="mt-4 text-center">
                {canResend ? (
                    <Button
                        variant="plain"
                        onClick={handleResendOTP}
                        className="text-primary-500"
                    >
                        {t('auth.verifyOTP.resend')}
                    </Button>
                ) : (
                    <p className="text-gray-500">
                        {t('auth.verifyOTP.resendIn', { seconds: resendTimer })}
                    </p>
                )}
            </div>
        </>
    )
}

export default VerifyOTP
