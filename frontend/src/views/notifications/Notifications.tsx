import { Card } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { HiBell, HiCheck, HiX } from 'react-icons/hi'
import { useState } from 'react'

type Notification = {
    id: string
    title: string
    message: string
    time: string
    read: boolean
}

const Notifications = () => {
    const { t } = useTranslation()
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: t('notifications.welcome.title'),
            message: t('notifications.welcome.message'),
            time: '2 hours ago',
            read: false,
        },
        {
            id: '2',
            title: t('notifications.profile.title'),
            message: t('notifications.profile.message'),
            time: '1 day ago',
            read: true,
        },
    ])

    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map((notification) =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification,
            ),
        )
    }

    const deleteNotification = (id: string) => {
        setNotifications(
            notifications.filter((notification) => notification.id !== id),
        )
    }

    const unreadCount = notifications.filter((n) => !n.read).length

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">
                    {t('notifications.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('notifications.subtitle', { count: unreadCount })}
                </p>
            </div>

            <Card>
                {notifications.length === 0 ? (
                    <div className="text-center py-8">
                        <HiBell className="text-4xl mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('notifications.empty')}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 ${
                                    !notification.read
                                        ? 'bg-gray-50 dark:bg-gray-800'
                                        : ''
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">
                                            {notification.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {notification.time}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!notification.read && (
                                            <button
                                                onClick={() =>
                                                    markAsRead(notification.id)
                                                }
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                                title={t(
                                                    'notifications.markAsRead',
                                                )}
                                            >
                                                <HiCheck className="text-lg" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                deleteNotification(
                                                    notification.id,
                                                )
                                            }
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                            title={t('notifications.delete')}
                                        >
                                            <HiX className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}

export default Notifications
