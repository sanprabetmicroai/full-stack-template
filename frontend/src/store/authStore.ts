import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/@types/auth'

interface SessionState {
    signedIn: boolean
}

interface UserState {
    user: User
    setUser: (user: User) => void
}

interface SessionUserState extends SessionState, UserState {
    setSessionSignedIn: (signedIn: boolean) => void
}

const initialState: SessionUserState = {
    signedIn: false,
    user: {
        id: '',
        phoneNumber: '',
        createdAt: '',
    },
    setUser: () => {},
    setSessionSignedIn: () => {},
}

export const useSessionUser = create<SessionUserState>()(
    persist(
        (set) => ({
            ...initialState,
            setUser: (user: User) => set({ user }),
            setSessionSignedIn: (signedIn: boolean) => set({ signedIn }),
        }),
        {
            name: 'session-storage',
        },
    ),
)

interface TokenState {
    token: string
    setToken: (token: string) => void
}

export const useToken = create<TokenState>()(
    persist(
        (set) => ({
            token: '',
            setToken: (token: string) => set({ token }),
        }),
        {
            name: 'token-storage',
        },
    ),
)
