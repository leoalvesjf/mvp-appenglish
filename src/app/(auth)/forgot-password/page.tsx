'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [resetToken, setResetToken] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            setError('Please enter your email')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to send reset email')
                setLoading(false)
                return
            }

            setSuccess(true)
            if (data.resetToken) {
                setResetToken(data.resetToken)
            }
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
                            Reset Password
                        </h1>
                        <p className="text-white/50 mt-1">Enter your email to receive reset instructions</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="space-y-4">
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm text-center">
                            <Mail className="w-8 h-8 mx-auto mb-2" />
                            <p>Check your inbox for the reset link!</p>
                        </div>

                        {resetToken && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-xl text-xs">
                                <p className="font-semibold mb-2">DEV MODE - Token:</p>
                                <code className="break-all">{resetToken}</code>
                                <p className="mt-2 text-yellow-300">
                                    Use it at: <Link href="/reset-password" className="underline">/reset-password</Link>
                                </p>
                            </div>
                        )}

                        <Link
                            href="/login"
                            className="block w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all flex items-center justify-center"
                        >
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <p className="text-center text-sm text-white/40 mt-6">
                    Remember your password?{' '}
                    <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
