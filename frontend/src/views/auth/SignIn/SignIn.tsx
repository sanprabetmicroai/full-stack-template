import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Link } from 'react-router-dom'
import { toast } from '@/components/ui/toast'
import { Notification } from '@/components/ui/Notification'
import { useTranslation } from 'react-i18next'

type SignInProps = {
    disableSubmit?: boolean
}

export const SignInBase = ({ disableSubmit }: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()
    const { t } = useTranslation()

    const handleMessage = (message: string, isError: boolean = false) => {
        if (isError) {
            setMessage(message)
        } else {
            toast.push(
                <Notification title="Success" type="success">
                    {message}
                </Notification>,
            )
        }
    }

    return (
        <>
            <div className="mb-8">
                <Logo type="streamline" imgClass="mx-auto" logoWidth={60} />
            </div>
            <div className="mb-10">
                <h2 className="mb-2">{t('auth.signIn.title')}</h2>
                <p className="font-semibold heading-text">
                    {t('auth.signIn.subtitle')}
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignInForm
                disableSubmit={disableSubmit}
                setMessage={handleMessage}
            />
            <div className="mt-4 text-center">
                <span>{t('auth.signIn.noAccount')} </span>
                <Link to="/sign-up" className="text-primary-500">
                    {t('auth.signIn.signUp')}
                </Link>
            </div>
        </>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
