'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') || ''

    useEffect(() => {
        if (!token) {
            setError('No reset token provided')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            setError('No reset token provided')
            return
        }

        if (!password || !confirmPassword) {
            setError('Please fill in all fields')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to reset password')
                setLoading(false)
                return
            }

            setSuccess(true)
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

            <Link href="/login" className="absolute top-6 left-6 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md border border-white/10">
                <ArrowLeft className="w-5 h-5 text-white" />
            </Link>

            <div className="w-full max-w-md z-10 glass-card rounded-3xl p-8">
                <div className="text-center space-y-4 mb-8">
                    <div className="flex justify-center">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Brain className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            New Password
                        </h1>
                        <p className="text-white/50 mt-1">Enter your new password</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="space-y-4">
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                            <p className="font-semibold">Password reset successful!</p>
                            <p className="text-sm mt-1 text-green-300">You can now login with your new password.</p>
                        </div>

                        <Link
                            href="/login"
                            className="block w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all flex items-center justify-center"
                        >
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="password"
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />

                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />

                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="w-full h-12 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="text-center text-sm text-white/40 mt-6">
                    <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    )
}
