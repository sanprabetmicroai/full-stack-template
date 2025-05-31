import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth'
import PageContainer from '@/components/template/PageContainer'
import { Card } from '@/components/ui'

const Main = () => {
    const { t } = useTranslation()
    const { user } = useAuth()

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">
                    {t('main.welcome', { name: user?.name })}
                </h1>

                <Card className="mb-6">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {t('main.yourAstrology')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium mb-2">
                                    {t('main.birthDetails')}
                                </h3>
                                <p>
                                    {t('main.dateOfBirth')}: {user?.dateOfBirth}
                                </p>
                                <p>
                                    {t('main.timeOfBirth')}: {user?.timeOfBirth}
                                </p>
                                <p>
                                    {t('main.locationOfBirth')}:{' '}
                                    {user?.locationOfBirth}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">
                                    {t('main.dailyReport')}
                                </h3>
                                <p className="text-gray-600">
                                    {t('main.dailyReportPlaceholder')}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {t('main.quickLinks')}
                            </h2>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="/profile"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {t('main.editProfile')}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/notifications"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {t('main.viewNotifications')}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {t('main.upcomingFeatures')}
                            </h2>
                            <ul className="space-y-2 text-gray-600">
                                <li>{t('main.feature1')}</li>
                                <li>{t('main.feature2')}</li>
                                <li>{t('main.feature3')}</li>
                            </ul>
                        </div>
                    </Card>
                </div>
            </div>
        </PageContainer>
    )
}

export default Main
