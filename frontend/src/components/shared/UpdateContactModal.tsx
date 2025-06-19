import React, { useState, useEffect } from 'react'
import { Dialog, Form, FormItem, Input, Button } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
    apiRequestUpdateOTP,
    apiVerifyUpdateOTP,
    apiCheckResendStatus,
} from '@/services/AuthService'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PhoneInput from '@/components/shared/PhoneInput'

interface UpdateContactModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'email' | 'phone'
    currentValue: string
    userId: string
}

const emailSchema = z.object({
    value: z.string().email({ message: 'Invalid email address' }),
})

const phoneSchema = z.object({
    dialCode: z.string().min(1, { message: 'Please select a country code' }),
    phoneNumber: z
        .string()
        .min(1, { message: 'Please enter your phone number' })
        .regex(/^[0-9]+$/, {
            message: 'Please enter a valid phone number',
        }),
})

type EmailFormSchema = z.infer<typeof emailSchema>
type PhoneFormSchema = z.infer<typeof phoneSchema>

type OTPForm = { otp: string }

const UpdateContactModal: React.FC<UpdateContactModalProps> = ({
    isOpen,
    onClose,
    type,
    currentValue,
    userId,
}) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [step, setStep] = useState<'input' | 'otp'>('input')
    const [isLoading, setIsLoading] = useState(false)
    const [pendingValue, setPendingValue] = useState<string>('')
    const [resendCountdown, setResendCountdown] = useState(0)
    const [canResend, setCanResend] = useState(false)
    const [submitAttempted, setSubmitAttempted] = useState(false)

    // Email form with custom validation
    const {
        handleSubmit: handleEmailSubmit,
        register: registerEmail,
        formState: { errors: emailErrors },
        reset: resetEmail,
        watch: watchEmail,
        setError: setEmailError,
    } = useForm<EmailFormSchema>({
        resolver: zodResolver(emailSchema),
        defaultValues: { value: '' },
    })

    // Phone form with custom validation
    const {
        handleSubmit: handlePhoneSubmit,
        control: phoneControl,
        formState: { errors: phoneErrors },
        reset: resetPhone,
        getValues: getPhoneValues,
        watch: watchPhone,
        setError: setPhoneError,
    } = useForm<PhoneFormSchema>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { dialCode: '+1', phoneNumber: '' },
    })

    // OTP form
    const [otp, setOtp] = useState('')
    const [otpError, setOtpError] = useState<string | null>(null)

    // Watch form values for real-time validation
    const emailValue = watchEmail('value')
    const phoneValues = watchPhone(['dialCode', 'phoneNumber'])
    const phoneValue =
        (phoneValues as any).dialCode + (phoneValues as any).phoneNumber

    // Check if current input matches current value
    const isSameValue = () => {
        if (type === 'email') {
            return emailValue === currentValue
        } else {
            return phoneValue === currentValue
        }
    }

    // Get validation error for same value
    const getSameValueError = () => {
        if (isSameValue() && (emailValue || phoneValue)) {
            return t('profile.sameValueError', { type: getFieldLabel() })
        }
        return null
    }

    // Countdown timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (resendCountdown > 0) {
            interval = setInterval(() => {
                setResendCountdown((prev) => {
                    if (prev <= 1) {
                        setCanResend(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [resendCountdown])

    // Check resend status when entering OTP step
    useEffect(() => {
        if (step === 'otp' && pendingValue) {
            checkResendStatus()
        }
    }, [step, pendingValue])

    // Log modal state changes
    useEffect(() => {
        if (isOpen) {
            console.log('[UpdateContactModal] Modal opened for type:', type)
        } else {
            console.log('[UpdateContactModal] Modal closed')
        }
    }, [isOpen, type])

    useEffect(() => {
        console.log('[UpdateContactModal] submitAttempted:', submitAttempted)
    }, [submitAttempted])
    useEffect(() => {
        if (type === 'email') {
            console.log(
                '[UpdateContactModal] isSameValue (email):',
                isSameValue(),
                'emailValue:',
                emailValue,
                'currentValue:',
                currentValue,
            )
        } else {
            console.log(
                '[UpdateContactModal] isSameValue (phone):',
                isSameValue(),
                'phoneValue:',
                phoneValue,
                'currentValue:',
                currentValue,
            )
        }
    }, [emailValue, phoneValue, currentValue, type])

    const checkResendStatus = async () => {
        try {
            const tag = type === 'email' ? 'update_email' : 'update_phone'
            const identifierType = type === 'email' ? 'email' : 'phone'

            const response = await apiCheckResendStatus({
                identifier: pendingValue,
                identifierType,
                tag,
            })

            if (response.success) {
                setCanResend(response.data.allowed)
                if (!response.data.allowed) {
                    setResendCountdown(response.data.timeRemaining)
                }
            }
        } catch (error) {
            console.error('Error checking resend status:', error)
            setCanResend(true) // Default to allowing resend if check fails
        }
    }

    const handleRequestOTP = async (data: any) => {
        setIsLoading(true)
        setSubmitAttempted(true)
        try {
            let value = ''
            if (type === 'email') {
                value = data.value
                if (value === currentValue) {
                    setEmailError('value', {
                        type: 'manual',
                        message: t('profile.sameValueError', {
                            type: getFieldLabel(),
                        }),
                    })
                    setIsLoading(false)
                    return
                }
            } else {
                value = data.dialCode + data.phoneNumber
                if (value === currentValue) {
                    setPhoneError('phoneNumber', {
                        type: 'manual',
                        message: t('profile.sameValueError', {
                            type: getFieldLabel(),
                        }),
                    })
                    setIsLoading(false)
                    return
                }
            }

            console.log('[UpdateContactModal] Submitting value for OTP:', value)
            await apiRequestUpdateOTP({
                type,
                value,
            })
            setPendingValue(value)
            setStep('otp')
            setCanResend(false)
            setResendCountdown(30) // Start 30-second countdown
            console.log(
                '[UpdateContactModal] OTP sent successfully for',
                type,
                value,
            )
            toast.success(t('profile.otpSent'))
        } catch (error: any) {
            console.error('[UpdateContactModal] OTP request failed:', error)
            toast.error(
                error.response?.data?.message || t('profile.otpRequestError'),
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOTP = async () => {
        if (!canResend || resendCountdown > 0) return

        setIsLoading(true)
        try {
            const tag = type === 'email' ? 'update_email' : 'update_phone'
            const identifierType = type === 'email' ? 'email' : 'phone'

            await apiRequestUpdateOTP({
                type,
                value: pendingValue,
            })

            setCanResend(false)
            setResendCountdown(30) // Start 30-second countdown
            toast.success(t('profile.otpResent'))
            console.log('[UpdateContactModal] OTP resent successfully')
        } catch (error: any) {
            console.error('[UpdateContactModal] OTP resend failed:', error)
            toast.error(
                error.response?.data?.message || t('profile.otpResendError'),
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setOtpError(null)
        if (!otp) {
            setOtpError(t('profile.enterOTP'))
            return
        }
        setIsLoading(true)
        try {
            console.log(
                '[UpdateContactModal] Submitting OTP for',
                type,
                pendingValue,
                'OTP:',
                otp,
            )
            await apiVerifyUpdateOTP({
                type,
                value: pendingValue,
                otp,
            })
            toast.success(t('profile.updateSuccess'))
            queryClient.invalidateQueries({ queryKey: ['user', userId] })
            console.log('[UpdateContactModal] OTP verified and contact updated')
            handleClose()
        } catch (error: any) {
            setOtpError(
                error.response?.data?.message ||
                    t('profile.otpVerificationError'),
            )
            console.error(
                '[UpdateContactModal] OTP verification failed:',
                error,
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setStep('input')
        setPendingValue('')
        setOtp('')
        setOtpError(null)
        setResendCountdown(0)
        setCanResend(false)
        resetEmail()
        resetPhone()
        console.log('[UpdateContactModal] Modal reset and closed')
        onClose()
    }

    const getFieldLabel = () => {
        return type === 'email' ? t('profile.email') : t('profile.phone')
    }

    const getPlaceholder = () => {
        return type === 'email'
            ? t('profile.enterNewEmail')
            : t('profile.enterNewPhone')
    }

    // Breadcrumb/progress bar
    const renderBreadcrumb = () => (
        <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
                <div
                    className={`h-2 w-2 rounded-full ${step === 'input' ? 'bg-blue-500' : 'bg-gray-400'}`}
                ></div>
                <span
                    className={`text-sm ${step === 'input' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}
                >
                    {t('profile.newValue', { type: getFieldLabel() })}
                </span>
                <div className="h-0.5 w-6 bg-gray-300 mx-2"></div>
                <div
                    className={`h-2 w-2 rounded-full ${step === 'otp' ? 'bg-blue-500' : 'bg-gray-400'}`}
                ></div>
                <span
                    className={`text-sm ${step === 'otp' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}
                >
                    {t('profile.enterOTP')}
                </span>
            </div>
        </div>
    )

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={400}>
            <div className="p-6">
                {renderBreadcrumb()}
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {t('profile.updateContact', { type: getFieldLabel() })}
                </h3>
                {step === 'input' ? (
                    <Form
                        onSubmit={
                            type === 'email'
                                ? handleEmailSubmit(handleRequestOTP)
                                : handlePhoneSubmit(handleRequestOTP)
                        }
                    >
                        <FormItem
                            label={t('profile.currentValue', {
                                type: getFieldLabel(),
                            })}
                        >
                            <div className="bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 text-gray-600 dark:text-gray-300">
                                {currentValue || t('profile.noValue')}
                            </div>
                        </FormItem>
                        {type === 'email' ? (
                            <FormItem
                                label={t('profile.newValue', {
                                    type: getFieldLabel(),
                                })}
                                invalid={
                                    Boolean(emailErrors.value) ||
                                    (submitAttempted && isSameValue())
                                }
                                errorMessage={
                                    emailErrors.value?.message ||
                                    (submitAttempted && isSameValue()
                                        ? t('profile.sameValueError', {
                                              type: getFieldLabel(),
                                          })
                                        : undefined)
                                }
                            >
                                <Input
                                    type="email"
                                    {...registerEmail('value')}
                                    placeholder={getPlaceholder()}
                                    required
                                />
                            </FormItem>
                        ) : (
                            <PhoneInput
                                control={phoneControl}
                                errors={phoneErrors}
                                placeholder={getPlaceholder()}
                            />
                        )}
                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="plain"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={isLoading}
                            >
                                {t('profile.sendOTP')}
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <Form onSubmit={handleVerifyOTP}>
                        <FormItem
                            label={t('profile.enterOTP')}
                            invalid={Boolean(otpError)}
                            errorMessage={otpError || undefined}
                        >
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder={t('profile.otpPlaceholder')}
                                maxLength={6}
                                required
                            />
                        </FormItem>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {t('profile.otpSentTo', {
                                type: getFieldLabel(),
                                value: pendingValue,
                            })}
                        </div>

                        {/* Resend OTP Section */}
                        <div className="mb-4">
                            {resendCountdown > 0 ? (
                                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                    {t('profile.resendIn', {
                                        seconds: resendCountdown,
                                    })}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={!canResend || isLoading}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed underline"
                                    >
                                        {t('profile.resendOTP')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="plain"
                                onClick={() => {
                                    setStep('input')
                                    console.log(
                                        '[UpdateContactModal] Back to input step',
                                    )
                                }}
                                disabled={isLoading}
                            >
                                {t('common.back')}
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={isLoading}
                            >
                                {t('profile.verifyAndUpdate')}
                            </Button>
                        </div>
                    </Form>
                )}
            </div>
        </Dialog>
    )
}

export default UpdateContactModal
