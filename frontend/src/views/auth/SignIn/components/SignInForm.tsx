import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/auth'
import Button from '@/components/ui/Button'
import FormItem from '@/components/ui/Form/FormItem'
import { Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import type { SignInFormSchema } from '@/@types/auth'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    phoneNumber: z
        .string({ required_error: 'Please enter your phone number' })
        .min(1, { message: 'Please enter your phone number' })
        .regex(/^\+?[1-9]\d{1,14}$/, {
            message: 'Please enter a valid phone number',
        }),
    otp: z
        .string()
        .min(6, { message: 'OTP must be 6 digits' })
        .max(6, { message: 'OTP must be 6 digits' })
        .optional(),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [otpSent, setOtpSent] = useState<boolean>(false)

    const { disableSubmit = false, className, setMessage, passwordHint } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            phoneNumber: '',
            otp: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const { signIn, verifyOTP } = useAuth()
    const phoneNumber = watch('phoneNumber')

    const onSubmit = (data: SignInFormSchema) => {
        console.log('Form submitted with data:', data)
        onSignIn(data)
    }

    const onSignIn = async (values: SignInFormSchema) => {
        console.log(
            'Button clicked - onSignIn function called with values:',
            values,
        )

        if (!disableSubmit) {
            console.log('Starting sign in process with values:', {
                phoneNumber: values.phoneNumber,
                otpSent,
            })
            setSubmitting(true)

            if (!otpSent) {
                console.log('Attempting to send OTP to:', values.phoneNumber)
                const result = await signIn({ phoneNumber: values.phoneNumber })
                console.log('Sign in result:', result)

                if (result?.status === 'success') {
                    console.log('OTP sent successfully')
                    setOtpSent(true)
                    setMessage?.(result.message)
                } else {
                    console.error('Failed to send OTP:', result)
                    setMessage?.(result.message)
                }
            } else {
                console.log('Attempting to verify OTP for:', values.phoneNumber)
                const result = await verifyOTP({
                    phoneNumber: values.phoneNumber,
                    otp: values.otp || '',
                })
                console.log('OTP verification result:', result)

                if (result?.status === 'failed') {
                    console.error('OTP verification failed:', result)
                    setMessage?.(result.message)
                }
            }
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            <Form
                onSubmit={handleSubmit(onSubmit)}
                onClick={() => console.log('Form clicked')}
            >
                <FormItem
                    label="Phone Number"
                    invalid={Boolean(errors.phoneNumber)}
                    errorMessage={errors.phoneNumber?.message}
                >
                    <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="tel"
                                placeholder="+1234567890"
                                autoComplete="tel"
                                disabled={otpSent}
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                {otpSent && (
                    <FormItem
                        label="OTP"
                        invalid={Boolean(errors.otp)}
                        errorMessage={errors.otp?.message}
                    >
                        <Controller
                            name="otp"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                )}
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    disabled={disableSubmit}
                    onClick={(e) => {
                        console.log('Button clicked directly')
                        e.preventDefault()
                        const formData = watch()
                        console.log('Current form data:', formData)
                        onSubmit(formData)
                    }}
                >
                    {otpSent ? 'Verify OTP' : 'Send OTP'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
