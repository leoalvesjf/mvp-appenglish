'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))
        if (token) {
            router.push('/dashboard')
        }
    }, [router])

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Login failed')
                setLoading(false)
                return
            }

            router.push('/dashboard')
            router.refresh()
        } catch {
            setError('An error occurred. Please try again.')
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md z-10 border border-white/10 bg-black/40 backdrop-blur-xl rounded-3xl p-8">
                <div className="text-center space-y-4 mb-8">
                    <div className="flex justify-center">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <Brain className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-white/50 text-sm">
                            Sign in to continue your path to fluency
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </button>
                </div>

                <div className="flex justify-center mt-6">
                    <Link href="/register" className="text-sm text-white/40 hover:text-primary transition-colors">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    )
}
