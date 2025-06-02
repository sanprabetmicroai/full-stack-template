import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { HiLockClosed } from 'react-icons/hi'

const AccessDenied = () => {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8">
                <div className="flex justify-center mb-6">
                    <HiLockClosed className="text-6xl text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {t('accessDenied.title', 'Access Denied')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {t(
                        'accessDenied.message',
                        'You do not have permission to access this page.',
                    )}
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {t('accessDenied.backToHome', 'Back to Home')}
                </Link>
            </div>
        </div>
    )
}

export default AccessDenied
