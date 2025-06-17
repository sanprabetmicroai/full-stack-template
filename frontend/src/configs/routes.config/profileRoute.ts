import { lazy } from 'react'
import { USER } from '@/constants/roles.constant'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import type { Routes } from '@/@types/routes'

const profileRoute: Routes = [
    {
        key: 'profile',
        path: '/profile',
        component: lazy(() => import('@/views/profile/Profile')),
        authority: [USER],
        meta: {
            pageContainerType: 'contained',
            layout: LAYOUT_COLLAPSIBLE_SIDE,
        },
    },
    {
        key: 'notifications',
        path: '/notifications',
        component: lazy(() => import('@/views/notifications/Notifications')),
        authority: [USER],
        meta: {
            pageContainerType: 'contained',
            layout: LAYOUT_COLLAPSIBLE_SIDE,
        },
    },
]

export default profileRoute
