'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))
        
        if (!token) {
            router.push('/login')
            return
        }

        fetch('/api/auth/me')
            .then(res => {
                if (!res.ok) {
                    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                    router.push('/login')
                    return
                }
                setChecking(false)
            })
            .catch(() => {
                document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                router.push('/login')
            })
    }, [router])

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return <>{children}</>
}
