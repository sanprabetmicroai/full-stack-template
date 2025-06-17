import ConfigProvider from '@/components/ui/ConfigProvider'
import { themeConfig } from '@/configs/theme.config'
import useDarkMode from '@/utils/hooks/useDarkMode'
import useThemeSchema from '@/utils/hooks/useThemeSchema'
import useLocale from '@/utils/hooks/useLocale'
import useDirection from '@/utils/hooks/useDirection'
import type { CommonProps } from '@/@types/common'
import { ErrorBoundary } from 'react-error-boundary'

const ErrorFallback = ({
    error,
    resetErrorBoundary,
}: {
    error: Error
    resetErrorBoundary: () => void
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                    Something went wrong
                </h2>
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded">
                    <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
                        {error.message}
                    </p>
                    {error.stack && (
                        <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40">
                            {error.stack}
                        </pre>
                    )}
                </div>
                <button
                    onClick={resetErrorBoundary}
                    className="w-full px-4 py-2 text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}

const Theme = (props: CommonProps) => {
    const { locale } = useLocale()

    // Call hooks at the top level
    useThemeSchema()
    useDarkMode()
    useDirection()

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // Reset the state here
                window.location.reload()
            }}
            onError={(error, errorInfo) => {
                // Log the error to your error reporting service
                console.error('Error caught by boundary:', error)
                console.error('Error info:', errorInfo)
            }}
        >
            <ConfigProvider
                value={{
                    locale: locale,
                    ...themeConfig,
                }}
            >
                {props.children}
            </ConfigProvider>
        </ErrorBoundary>
    )
}

export default Theme
