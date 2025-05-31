import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/template/PageContainer'
import { Card, Badge } from '@/components/ui'

interface Notification {
    id: string
    title: string
    message: string
    timestamp: Date
    read: boolean
}

const Notifications = () => {
    const { t } = useTranslation()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // TODO: Implement real-time notifications using your backend
        // This is a placeholder for demonstration
        const mockNotifications: Notification[] = [
            {
                id: '1',
                title: t('notifications.welcome'),
                message: t('notifications.welcomeMessage'),
                timestamp: new Date(),
                read: false,
            },
        ]
        setNotifications(mockNotifications)
        setLoading(false)
    }, [t])

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification,
            ),
        )
    }

    if (loading) {
        return (
            <PageContainer>
                <div className="max-w-4xl mx-auto p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-24 bg-gray-200 rounded"
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {t('notifications.title')}
                    </h1>
                    <Badge
                        content={notifications.filter((n) => !n.read).length}
                    >
                        {t('notifications.unread')}
                    </Badge>
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <Card>
                            <div className="p-6 text-center text-gray-500">
                                {t('notifications.noNotifications')}
                            </div>
                        </Card>
                    ) : (
                        notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`cursor-pointer transition-colors ${
                                    notification.read
                                        ? 'bg-gray-50'
                                        : 'bg-white'
                                }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold mb-2">
                                                {notification.title}
                                            </h3>
                                            <p className="text-gray-600">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <Badge content="New" />
                                        )}
                                    </div>
                                    <div className="mt-4 text-sm text-gray-500">
                                        {new Date(
                                            notification.timestamp,
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </PageContainer>
    )
}

export default Notifications
