import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/auth'
import Button from '@/components/ui/Button'
import FormItem from '@/components/ui/Form/FormItem'
import { Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Logo from '@/components/template/Logo'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from '@/components/ui/toast'
import { Notification } from '@/components/ui/Notification'

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
    phoneNumber: z
        .string()
        .min(1, { message: 'Please enter your phone number' })
        .regex(/^\+?[1-9]\d{1,14}$/, {
            message: 'Please enter a valid phone number',
        }),
})

type SignUpFormSchema = z.infer<typeof validationSchema>

const SignUp = () => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { signUp } = useAuth()
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
            phoneNumber: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (data: SignUpFormSchema) => {
        setSubmitting(true)
        try {
            // Combine firstName and lastName into name for the API
            const signUpData = {
                ...data,
                name: `${data.firstName} ${data.lastName}`,
            }
            const result = await signUp(signUpData)
            if (result?.status === 'sign_in_required') {
                toast.push(
                    <Notification title="Success" type="success">
                        Account created successfully! Please sign in.
                    </Notification>,
                )
                navigate('/sign-in')
            } else if (result?.status === 'success') {
                toast.push(
                    <Notification title="Success" type="success">
                        Account created successfully! Please verify your phone
                        number.
                    </Notification>,
                )
                navigate('/verify-email')
            } else {
                toast.push(
                    <Notification title="Error" type="danger">
                        {result?.message || 'Failed to create account'}
                    </Notification>,
                )
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred. Please try again later.'
            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
            )
        }
        setSubmitting(false)
    }

    return (
        <>
            <div className="mb-8">
                <Logo type="streamline" imgClass="mx-auto" logoWidth={60} />
            </div>
            <div className="mb-10">
                <h2 className="mb-2">Create Account</h2>
                <p className="font-semibold heading-text">
                    Please fill in your details to sign up!
                </p>
            </div>
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
                    <FormItem
                        label="Whatsapp Number"
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
                    >
                        Sign Up
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
