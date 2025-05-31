import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/template/PageContainer'
import { Card, Button } from '@/components/ui'

const VerifyEmail = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token')
            if (!token) {
                setError(t('verifyEmail.invalidToken'))
                setLoading(false)
                return
            }

            try {
                // TODO: Implement email verification with your backend
                await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call
                setLoading(false)
            } catch {
                setError(t('verifyEmail.error'))
                setLoading(false)
            }
        }

        verifyEmail()
    }, [searchParams, t])

    if (loading) {
        return (
            <PageContainer>
                <div className="max-w-md mx-auto p-6">
                    <Card>
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p>{t('verifyEmail.verifying')}</p>
                        </div>
                    </Card>
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <div className="max-w-md mx-auto p-6">
                <Card>
                    <div className="p-6 text-center">
                        {error ? (
                            <>
                                <div className="text-red-500 text-5xl mb-4">
                                    ⚠️
                                </div>
                                <h1 className="text-2xl font-bold mb-4">
                                    {t('verifyEmail.errorTitle')}
                                </h1>
                                <p className="text-gray-600 mb-6">{error}</p>
                            </>
                        ) : (
                            <>
                                <div className="text-green-500 text-5xl mb-4">
                                    ✓
                                </div>
                                <h1 className="text-2xl font-bold mb-4">
                                    {t('verifyEmail.successTitle')}
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    {t('verifyEmail.successMessage')}
                                </p>
                            </>
                        )}
                        <Button
                            variant="solid"
                            onClick={() => navigate('/login')}
                        >
                            {t('verifyEmail.login')}
                        </Button>
                    </div>
                </Card>
            </div>
        </PageContainer>
    )
}

export default VerifyEmail
