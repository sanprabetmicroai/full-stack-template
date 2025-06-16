import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import profileRoute from './profileRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
        meta: {
            pageContainerType: 'default',
        },
    },
    ...profileRoute,
    ...othersRoute,
]
