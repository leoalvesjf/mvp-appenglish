'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [checking, setChecking] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        console.log('[AuthGuard] Starting auth check...')

        const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))
        console.log('[AuthGuard] Token found:', !!token, token?.substring(0, 30) + '...')
        
        if (!token) {
            console.log('[AuthGuard] No token, redirecting to login')
            router.push('/login')
            return
        }

        fetch('/api/auth/me')
            .then(res => {
                console.log('[AuthGuard] /api/auth/me response:', res.status)
                if (!res.ok) {
                    console.log('[AuthGuard] API returned not ok, clearing cookie and redirecting')
                    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                    router.push('/login')
                    return
                }
                return res.json()
            })
            .then(data => {
                console.log('[AuthGuard] User data:', data)
                setChecking(false)
            })
            .catch(err => {
                console.error('[AuthGuard] Fetch error:', err)
                document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                router.push('/login')
            })
    }, [router])

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-white/50 text-sm">Checking authentication...</p>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
            </div>
        )
    }

    return <>{children}</>
}
