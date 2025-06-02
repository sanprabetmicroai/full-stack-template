import { Card } from '@/components/ui'
import { useAuth } from '@/auth'
import { useTranslation } from 'react-i18next'
import { HiUser, HiBell, HiCog } from 'react-icons/hi'
import { Link } from 'react-router-dom'

const Dashboard = () => {
    const { t } = useTranslation()
    const { user } = useAuth()

    const quickActions = [
        {
            title: t('dashboard.profile'),
            description: t('dashboard.profileDesc'),
            icon: <HiUser className="text-2xl" />,
            path: '/profile',
        },
        {
            title: t('dashboard.notifications'),
            description: t('dashboard.notificationsDesc'),
            icon: <HiBell className="text-2xl" />,
            path: '/notifications',
        },
        {
            title: t('dashboard.settings'),
            description: t('dashboard.settingsDesc'),
            icon: <HiCog className="text-2xl" />,
            path: '/settings',
        },
    ]

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">
                    {t('dashboard.welcome', { name: user?.firstName })}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('dashboard.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                    <Link key={action.path} to={action.path}>
                        <Card
                            className="h-full hover:shadow-lg transition-shadow duration-200"
                            header={{
                                content: (
                                    <div className="flex items-center gap-3">
                                        {action.icon}
                                        <h3 className="font-semibold">
                                            {action.title}
                                        </h3>
                                    </div>
                                ),
                            }}
                        >
                            <p className="text-gray-600 dark:text-gray-400">
                                {action.description}
                            </p>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-8">
                <Card
                    header={{
                        content: t('dashboard.recentActivity'),
                    }}
                >
                    <div className="text-gray-600 dark:text-gray-400">
                        {t('dashboard.noActivity')}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard
