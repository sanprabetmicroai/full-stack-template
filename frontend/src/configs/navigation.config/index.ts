import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'
import { USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'profile',
        path: '',
        title: 'Profile',
        translateKey: 'nav.profile',
        icon: 'profile',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [USER],
        subMenu: [
            {
                key: 'dashboard',
                path: '/dashboard',
                title: 'Dashboard',
                translateKey: 'nav.profile.dashboard',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [USER],
                subMenu: [],
            },
            {
                key: 'profile',
                path: '/profile',
                title: 'Profile',
                translateKey: 'nav.profile.profile',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [USER],
                subMenu: [],
            },
            {
                key: 'settings',
                path: '/settings',
                title: 'Settings',
                translateKey: 'nav.profile.settings',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [USER],
                subMenu: [],
            },
            {
                key: 'notifications',
                path: '/notifications',
                title: 'Notifications',
                translateKey: 'nav.profile.notifications',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [USER],
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
