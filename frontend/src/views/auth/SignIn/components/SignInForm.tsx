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

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage: (message: string, isError?: boolean) => void
}

const validationSchema = z.object({
    dialCode: z.string().min(1, { message: 'Please select a country code' }),
    phoneNumber: z
        .string()
        .min(1, { message: 'Please enter your phone number' })
        .regex(/^[0-9]+$/, {
            message: 'Please enter a valid phone number',
        }),
})

type SignInFormSchema = z.infer<typeof validationSchema>

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { disableSubmit = false, className, setMessage } = props

    const navigate = useNavigate()
    const { sendOTP } = useAuth()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            dialCode: '+1',
            phoneNumber: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (data: SignInFormSchema) => {
        if (disableSubmit) return

        setSubmitting(true)

        try {
            const fullPhoneNumber = data.dialCode + data.phoneNumber
            console.log('SignIn: Sending OTP for:', fullPhoneNumber)
            const result = await sendOTP({ phoneNumber: fullPhoneNumber })

            if (result?.status === 'success') {
                console.log('SignIn: OTP sent successfully')
                setMessage('OTP sent successfully')
                navigate('/verify-otp', {
                    state: {
                        phoneNumber: fullPhoneNumber,
                        isSignUp: false,
                    },
                })
            } else {
                console.error('SignIn: Failed to send OTP:', result)
                setMessage(result?.message || 'Failed to send OTP', true)
            }
        } catch (error) {
            console.error('SignIn: Unexpected error:', error)
            setMessage('An unexpected error occurred', true)
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
                    placeholder="Enter your phone number"
                />
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    disabled={disableSubmit || isSubmitting}
                >
                    Continue
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
