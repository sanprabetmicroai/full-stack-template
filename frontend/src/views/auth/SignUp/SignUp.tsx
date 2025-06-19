import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth'
import Button from '@/components/ui/Button'
import FormItem from '@/components/ui/Form/FormItem'
import { Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/shared/PhoneInput'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import { useTranslation } from 'react-i18next'

const SignUp = () => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const { t } = useTranslation()

    const { sendOTP } = useAuth()
    const navigate = useNavigate()

    const validationSchema = z.object({
        firstName: z
            .string()
            .min(1, { message: t('auth.validation.firstNameRequired') })
            .max(50, { message: t('auth.validation.firstNameTooLong') }),
        lastName: z
            .string()
            .min(1, { message: t('auth.validation.lastNameRequired') })
            .max(50, { message: t('auth.validation.lastNameTooLong') }),
        email: z
            .string()
            .min(1, { message: t('auth.validation.emailRequired') })
            .email({ message: t('auth.validation.emailInvalid') }),
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
            firstName: '',
            lastName: '',
            email: '',
            dialCode: '+1',
            phoneNumber: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (data: any) => {
        setSubmitting(true)
        setError('')

        try {
            const fullPhoneNumber = data.dialCode + data.phoneNumber
            console.log('SignUp: Sending OTP for:', fullPhoneNumber)
            const result = await sendOTP({
                identifier: fullPhoneNumber,
                identifierType: 'phone',
                tag: 'signup',
            })

            if (result?.status === 'success') {
                console.log(
                    'SignUp: OTP sent successfully, navigating to verification',
                )
                // Navigate to OTP verification with sign-up data
                navigate('/verify-otp', {
                    state: {
                        phoneNumber: fullPhoneNumber,
                        isSignUp: true,
                        userData: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            email: data.email,
                            phoneNumber: fullPhoneNumber,
                        },
                    },
                })
            } else {
                console.error('SignUp: Failed to send OTP:', result)
                setError(result.message)
            }
        } catch (error) {
            console.error('SignUp: Unexpected error:', error)
            setError(t('auth.signIn.unexpectedError'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <div className="mb-8">
                <Logo type="streamline" imgClass="mx-auto" logoWidth={60} />
            </div>
            <div className="mb-10">
                <h2 className="mb-2">{t('auth.signUp.title')}</h2>
                <p className="font-semibold heading-text">
                    {t('auth.signUp.subtitle')}
                </p>
            </div>

            {error && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{error}</span>
                </Alert>
            )}

            <div>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem
                        label={t('auth.signUp.firstName')}
                        invalid={Boolean(errors.firstName)}
                        errorMessage={errors.firstName?.message}
                    >
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder={t(
                                        'auth.signUp.firstNamePlaceholder',
                                    )}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label={t('auth.signUp.lastName')}
                        invalid={Boolean(errors.lastName)}
                        errorMessage={errors.lastName?.message}
                    >
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder={t(
                                        'auth.signUp.lastNamePlaceholder',
                                    )}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label={t('auth.signUp.email')}
                        invalid={Boolean(errors.email)}
                        errorMessage={errors.email?.message}
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    placeholder={t(
                                        'auth.signUp.emailPlaceholder',
                                    )}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <PhoneInput
                        control={control}
                        errors={errors}
                        placeholder={t('auth.signUp.phonePlaceholder')}
                    />

                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {t('auth.signUp.continue')}
                    </Button>
                </Form>

                <div className="mt-4 text-center">
                    <span>{t('auth.signUp.hasAccount')} </span>
                    <Link to="/sign-in" className="text-primary-500">
                        {t('auth.signUp.signIn')}
                    </Link>
                </div>
            </div>
        </>
    )
}

export default SignUp
