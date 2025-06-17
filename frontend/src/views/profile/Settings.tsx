import { Card, Select } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/store/themeStore'
import presetThemeSchemaConfig from '@/configs/preset-theme-schema.config'
import {
    LAYOUT_COLLAPSIBLE_SIDE,
    LAYOUT_STACKED_SIDE,
} from '@/constants/theme.constant'
import type { LayoutType } from '@/@types/theme'
import type { SingleValue } from 'react-select'
import ModeSwitcher from '@/components/template/ThemeConfigurator/ModeSwitcher'

type ThemeOption = {
    value: string
    label: string
}

type LayoutOption = {
    value: LayoutType
    label: string
}

const Settings = () => {
    const { t } = useTranslation()
    const { themeSchema, setSchema, layout, setLayout } = useThemeStore()

    const themeOptions = Object.keys(presetThemeSchemaConfig).map((key) => ({
        value: key,
        label: t(`theme.${key}`),
    }))

    const layoutOptions: LayoutOption[] = [
        {
            value: LAYOUT_COLLAPSIBLE_SIDE,
            label: t('settings.layouts.collapsibleSide'),
        },
        {
            value: LAYOUT_STACKED_SIDE,
            label: t('settings.layouts.stackedSide'),
        },
    ]

    const handleThemeChange = (newValue: unknown) => {
        if (newValue) {
            setSchema((newValue as ThemeOption).value)
        }
    }

    const handleLayoutChange = (newValue: unknown) => {
        if (newValue) {
            setLayout((newValue as LayoutOption).value)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">
                    {t('settings.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('settings.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                    header={{
                        content: t('settings.appearance'),
                    }}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t('settings.theme')}
                            </label>
                            <Select
                                options={themeOptions}
                                value={themeOptions.find(
                                    (option) => option.value === themeSchema,
                                )}
                                onChange={handleThemeChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t('settings.layout')}
                            </label>
                            <Select
                                options={layoutOptions}
                                value={layoutOptions.find(
                                    (option) => option.value === layout.type,
                                )}
                                onChange={handleLayoutChange}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t('theme.dark')}
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('settings.darkModeDesc')}
                                </p>
                            </div>
                            <ModeSwitcher />
                        </div>
                    </div>
                </Card>

                <Card
                    header={{
                        content: t('settings.notifications'),
                    }}
                >
                    <div className="text-gray-600 dark:text-gray-400">
                        {t('settings.notificationsDesc')}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Settings
