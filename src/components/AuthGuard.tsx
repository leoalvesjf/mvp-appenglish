'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        console.log('[AuthGuard] Checking authentication...')

        fetch('/api/auth/me')
            .then(res => {
                console.log('[AuthGuard] /api/auth/me response:', res.status)
                if (!res.ok) {
                    console.log('[AuthGuard] Not authenticated, redirecting to login')
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
                router.push('/login')
            })
    }, [router])

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-white/50 text-sm">Checking authentication...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
