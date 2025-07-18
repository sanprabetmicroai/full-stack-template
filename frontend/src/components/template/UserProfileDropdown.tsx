import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import {
    PiUserDuotone,
    PiSignOutDuotone,
    PiBellDuotone,
    PiSunDuotone,
    PiMoonDuotone,
    PiPaletteDuotone,
} from 'react-icons/pi'
import { useAuth } from '@/auth'
import { useLocaleStore } from '@/store/localeStore'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/store/themeStore'
import useDarkMode from '@/utils/hooks/useDarkMode'
import Switcher from '@/components/ui/Switcher'
import classNames from '@/utils/classNames'
import { TbCheck } from 'react-icons/tb'
import presetThemeSchemaConfig from '@/configs/preset-theme-schema.config'
import type { JSX } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGetUser } from '@/services/UserService'
import type { User } from '@/@types/auth'
import SignOutModal from '@/components/shared/SignOutModal'
import { useState } from 'react'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const languageList = [
    { label: 'English', value: 'en', flag: 'US' },
    { label: 'Español', value: 'es', flag: 'ES' },
    { label: 'Português', value: 'pt', flag: 'PT' },
]

const LoadingAvatar = () => (
    <div className="animate-pulse">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    </div>
)

const LoadingText = () => (
    <div className="animate-pulse">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
)

const _UserDropdown = () => {
    const { user } = useAuth()
    const { signOut } = useAuth()
    const { currentLang: locale, setLang } = useLocaleStore((state) => state)
    const { t } = useTranslation()
    const [isDark, setIsDark] = useDarkMode()
    const { themeSchema, setSchema } = useThemeStore((state) => state)
    const [showSignOutModal, setShowSignOutModal] = useState(false)

    // Use the same query key as Profile.tsx
    const { data: userData, isLoading } = useQuery<User>({
        queryKey: ['user', user?.id],
        queryFn: () => apiGetUser(user?.id || ''),
        enabled: !!user?.id,
    })

    const dropdownItemList: DropdownList[] = [
        {
            label: t('common.profile'),
            path: '/profile',
            icon: <PiUserDuotone />,
        },
        {
            label: t('common.notifications'),
            path: '/notifications',
            icon: <PiBellDuotone />,
        },
    ]

    const handleSignOut = () => {
        setShowSignOutModal(true)
    }

    const handleSignOutConfirm = async (rating: number, feedback: string) => {
        try {
            await signOut({ rating, feedback })
            setShowSignOutModal(false)
        } catch (error) {
            console.error('Error during sign out:', error)
        }
    }

    const avatarProps = {
        icon: <PiUserDuotone />,
        src: userData?.profileImage,
    }

    const displayName = userData
        ? `${userData.firstName || ''} ${userData.lastName || ''}`
        : 'Loading...'

    return (
        <>
            <Dropdown
                className="flex"
                toggleClassName="flex items-center"
                renderTitle={
                    <div className="cursor-pointer flex items-center">
                        {isLoading ? (
                            <LoadingAvatar />
                        ) : (
                            <Avatar size={32} {...avatarProps} />
                        )}
                    </div>
                }
                placement="bottom-end"
            >
                <Dropdown.Item variant="header">
                    <div className="py-2 px-3 flex items-center gap-3">
                        {isLoading ? (
                            <LoadingAvatar />
                        ) : (
                            <Avatar {...avatarProps} />
                        )}
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                {isLoading ? <LoadingText /> : displayName}
                            </div>
                            <div className="text-xs">
                                {isLoading ? (
                                    <LoadingText />
                                ) : (
                                    userData?.phoneNumber ||
                                    'No phone number available'
                                )}
                            </div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                {dropdownItemList.map((item) => (
                    <Dropdown.Item
                        key={item.label}
                        eventKey={item.label}
                        className="px-0"
                    >
                        <Link
                            className="flex h-full w-full px-2"
                            to={item.path}
                        >
                            <span className="flex gap-2 items-center w-full">
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </span>
                        </Link>
                    </Dropdown.Item>
                ))}
                <Dropdown.Item variant="divider" />
                <Dropdown.Item variant="header">
                    <span className="text-sm font-semibold">
                        {t('settings.theme')}
                    </span>
                </Dropdown.Item>
                <Dropdown.Item className="px-2">
                    <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                            <span className="text-xl">
                                {isDark ? <PiMoonDuotone /> : <PiSunDuotone />}
                            </span>
                            <span>{t('settings.darkMode')}</span>
                        </span>
                        <Switcher
                            defaultChecked={isDark}
                            onChange={(checked) =>
                                setIsDark(checked ? 'dark' : 'light')
                            }
                        />
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="header">
                    <span className="text-sm font-semibold">
                        {t('settings.themeColor')}
                    </span>
                </Dropdown.Item>
                <Dropdown.Item className="px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">
                            <PiPaletteDuotone />
                        </span>
                        <div className="inline-flex items-center gap-2">
                            {Object.entries(presetThemeSchemaConfig).map(
                                ([key, value]) => (
                                    <button
                                        key={key}
                                        className={classNames(
                                            'h-6 w-6 rounded-full flex items-center justify-center border-2 border-white',
                                            themeSchema === key &&
                                                'ring-2 ring-primary',
                                        )}
                                        style={{
                                            backgroundColor:
                                                value[isDark ? 'dark' : 'light']
                                                    .primary || '',
                                        }}
                                        onClick={() => setSchema(key)}
                                    >
                                        {themeSchema === key ? (
                                            <TbCheck className="text-neutral text-sm" />
                                        ) : (
                                            <></>
                                        )}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                <Dropdown.Item variant="header">
                    <span className="text-sm font-semibold">
                        {t('common.language')}
                    </span>
                </Dropdown.Item>
                {languageList.map((lang) => (
                    <Dropdown.Item
                        key={lang.label}
                        className="justify-between px-2"
                        eventKey={lang.label}
                        onClick={() => setLang(lang.value)}
                    >
                        <span className="flex items-center">
                            <Avatar
                                size={18}
                                shape="circle"
                                src={`/img/countries/${lang.flag}.png`}
                            />
                            <span className="ltr:ml-2 rtl:mr-2">
                                {lang.label}
                            </span>
                        </span>
                        {locale === lang.value && (
                            <span className="text-emerald-500 text-lg">✓</span>
                        )}
                    </Dropdown.Item>
                ))}
                <Dropdown.Item variant="divider" />
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2"
                    onClick={handleSignOut}
                >
                    <span className="text-xl">
                        <PiSignOutDuotone />
                    </span>
                    <span>{t('common.signOut')}</span>
                </Dropdown.Item>
            </Dropdown>

            <SignOutModal
                isOpen={showSignOutModal}
                onClose={() => setShowSignOutModal(false)}
                onConfirm={handleSignOutConfirm}
            />
        </>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
