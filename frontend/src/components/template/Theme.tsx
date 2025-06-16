import ConfigProvider from '@/components/ui/ConfigProvider'
import { themeConfig } from '@/configs/theme.config'
import useDarkMode from '@/utils/hooks/useDarkMode'
import useThemeSchema from '@/utils/hooks/useThemeSchema'
import useLocale from '@/utils/hooks/useLocale'
import useDirection from '@/utils/hooks/useDirection'
import type { CommonProps } from '@/@types/common'
import { ErrorBoundary } from 'react-error-boundary'

const Theme = (props: CommonProps) => {
    const { locale } = useLocale()

    // Call hooks at the top level
    useThemeSchema()
    useDarkMode()
    useDirection()

    return (
        <ErrorBoundary
            fallback={<div>Something went wrong with the theme</div>}
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
