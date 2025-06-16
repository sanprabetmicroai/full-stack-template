import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import {
    PiUserDuotone,
    PiSignOutDuotone,
    PiGearDuotone,
    PiBellDuotone,
} from 'react-icons/pi'
import { useAuth } from '@/auth'
import { useLocaleStore } from '@/store/localeStore'
import { useTranslation } from 'react-i18next'
import type { JSX } from 'react'

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

const dropdownItemList: DropdownList[] = [
    {
        label: 'Profile',
        path: '/profile',
        icon: <PiUserDuotone />,
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: <PiGearDuotone />,
    },
    {
        label: 'Notifications',
        path: '/notifications',
        icon: <PiBellDuotone />,
    },
]

const _UserDropdown = () => {
    const { firstName, lastName, phoneNumber, profileImage } = useSessionUser(
        (state) => state.user,
    )
    const { signOut } = useAuth()
    const { currentLang: locale, setLang } = useLocaleStore((state) => state)
    const { t } = useTranslation()

    const handleSignOut = () => {
        signOut()
    }

    const avatarProps = {
        icon: <PiUserDuotone />,
        src: profileImage,
    }

    const displayName =
        firstName && lastName ? `${firstName} ${lastName}` : 'Anonymous'

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {displayName}
                        </div>
                        <div className="text-xs">
                            {phoneNumber || 'No phone number available'}
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
                    <Link className="flex h-full w-full px-2" to={item.path}>
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
                        <span className="ltr:ml-2 rtl:mr-2">{lang.label}</span>
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
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
