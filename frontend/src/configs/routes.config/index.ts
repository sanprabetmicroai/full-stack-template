import { lazy } from 'react'
import {
    publicRoutes as existingPublicRoutes,
    protectedRoutes,
} from './routes.config'

const publicRoutes = [
    {
        key: 'access-denied',
        path: '/access-denied',
        component: lazy(() => import('@/views/access-denied/AccessDenied')),
        authority: [],
        meta: {
            pageContainerType: 'default',
        },
    },
    ...existingPublicRoutes,
]

export { publicRoutes, protectedRoutes }
