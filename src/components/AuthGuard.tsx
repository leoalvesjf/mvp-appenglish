'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [checking, setChecking] = useState(true)
    const [debugInfo, setDebugInfo] = useState('')

    useEffect(() => {
        console.log('[AuthGuard] Starting auth check...')
        console.log('[AuthGuard] All cookies:', document.cookie)

        fetch('/api/auth/me')
            .then(res => {
                console.log('[AuthGuard] Response status:', res.status)
                return res.json().then(data => ({ status: res.status, data }))
            })
            .then(({ status, data }) => {
                console.log('[AuthGuard] Response data:', data)
                
                if (status !== 200 || !data.user) {
                    setDebugInfo(`Not authenticated. Status: ${status}, Has user: ${!!data.user}`)
                    console.log('[AuthGuard] Redirecting to login')
                    router.push('/login')
                    return
                }
                
                setChecking(false)
            })
            .catch(err => {
                console.error('[AuthGuard] Fetch error:', err)
                setDebugInfo(`Fetch error: ${err}`)
                router.push('/login')
            })
    }, [router])

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center max-w-md p-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-white/50 text-sm mb-2">Checking authentication...</p>
                    {debugInfo && (
                        <p className="text-red-400 text-xs break-all">{debugInfo}</p>
                    )}
                </div>
            </div>
        )
    }

    return <>{children}</>
}
