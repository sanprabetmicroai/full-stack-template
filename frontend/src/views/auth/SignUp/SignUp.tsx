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

const validationSchema = z.object({
    firstName: z
        .string()
        .min(1, { message: 'Please enter your first name' })
        .max(50, { message: 'First name is too long' }),
    lastName: z
        .string()
        .min(1, { message: 'Please enter your last name' })
        .max(50, { message: 'Last name is too long' }),
    email: z
        .string()
        .min(1, { message: 'Please enter your email' })
        .email({ message: 'Please enter a valid email' }),
    dialCode: z.string().min(1, { message: 'Please select a country code' }),
    phoneNumber: z
        .string()
        .min(1, { message: 'Please enter your phone number' })
        .regex(/^[0-9]+$/, {
            message: 'Please enter a valid phone number',
        }),
})

type SignUpFormSchema = z.infer<typeof validationSchema>

const SignUp = () => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const { sendOTP } = useAuth()
    const navigate = useNavigate()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignUpFormSchema>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            dialCode: '+1',
            phoneNumber: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (data: SignUpFormSchema) => {
        setSubmitting(true)
        setError('')

        try {
            const fullPhoneNumber = data.dialCode + data.phoneNumber
            console.log('SignUp: Sending OTP for:', fullPhoneNumber)
            const result = await sendOTP({ phoneNumber: fullPhoneNumber })

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
            setError('An unexpected error occurred')
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
                <h2 className="mb-2">Create Account</h2>
                <p className="font-semibold heading-text">
                    Please fill in your details to get started!
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
                        label="First Name"
                        invalid={Boolean(errors.firstName)}
                        errorMessage={errors.firstName?.message}
                    >
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="Enter your first name"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Last Name"
                        invalid={Boolean(errors.lastName)}
                        errorMessage={errors.lastName?.message}
                    >
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="Enter your last name"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Email"
                        invalid={Boolean(errors.email)}
                        errorMessage={errors.email?.message}
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

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
                        disabled={isSubmitting}
                    >
                        Continue
                    </Button>
                </Form>

                <div className="mt-4 text-center">
                    <span>Already have an account? </span>
                    <Link to="/sign-in" className="text-primary-500">
                        Sign In
                    </Link>
                </div>
            </div>
        </>
    )
}

export default SignUp
