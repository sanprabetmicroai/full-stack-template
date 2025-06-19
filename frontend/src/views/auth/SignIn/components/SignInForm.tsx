import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth'
import Button from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import PhoneInput from '@/components/shared/PhoneInput'
import type { CommonProps } from '@/@types/common'
import { useTranslation } from 'react-i18next'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage: (message: string, isError?: boolean) => void
}

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { disableSubmit = false, className, setMessage } = props
    const { t } = useTranslation()

    const navigate = useNavigate()
    const { sendOTP } = useAuth()

    const validationSchema = z.object({
        dialCode: z
            .string()
            .min(1, { message: t('auth.validation.countryCodeRequired') }),
        phoneNumber: z
            .string()
            .min(1, { message: t('auth.validation.phoneRequired') })
            .regex(/^[0-9]+$/, {
                message: t('auth.validation.phoneInvalid'),
            }),
    })

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: {
            dialCode: '+1',
            phoneNumber: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (data: any) => {
        if (disableSubmit) return

        setSubmitting(true)

        try {
            const fullPhoneNumber = data.dialCode + data.phoneNumber
            console.log('SignIn: Sending OTP for:', fullPhoneNumber)
            const result = await sendOTP({
                identifier: fullPhoneNumber,
                identifierType: 'phone',
                tag: 'login',
            })

            if (result?.status === 'success') {
                console.log('SignIn: OTP sent successfully')
                setMessage(t('auth.signIn.otpSent'))
                navigate('/verify-otp', {
                    state: {
                        phoneNumber: fullPhoneNumber,
                        isSignUp: false,
                    },
                })
            } else {
                console.error('SignIn: Failed to send OTP:', result)
                setMessage(result?.message || t('auth.signIn.otpError'), true)
            }
        } catch (error) {
            console.error('SignIn: Unexpected error:', error)
            setMessage(t('auth.signIn.unexpectedError'), true)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <PhoneInput
                    control={control}
                    errors={errors}
                    placeholder={t('auth.signIn.phonePlaceholder')}
                />
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    disabled={disableSubmit || isSubmitting}
                >
                    {t('auth.signIn.continue')}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
