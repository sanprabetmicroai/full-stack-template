import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface AuthorityGuardProps {
    userAuthority?: string
    authority?: string[]
    children: ReactNode
}

const AuthorityGuard = ({
    userAuthority,
    authority,
    children,
}: AuthorityGuardProps) => {
    if (!userAuthority || !authority) {
        return <>{children}</>
    }

    if (authority.includes(userAuthority)) {
        return <>{children}</>
    }

    return <Navigate to="/access-denied" replace />
}

export default AuthorityGuard
