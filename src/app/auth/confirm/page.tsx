'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

function ConfirmContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const token = searchParams.get('token')

        if (!token) {
            setStatus('error')
            setMessage('Invalid confirmation link')
            return
        }

        fetch('/api/auth/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success')
                    setMessage('Email verified successfully!')
                } else {
                    setStatus('error')
                    setMessage(data.error || 'Confirmation failed')
                }
            })
            .catch(() => {
                setStatus('error')
                setMessage('An error occurred')
            })
    }, [searchParams])

    return (
        <div className="w-full max-w-md z-10 glass-card rounded-3xl p-8 text-center">
            <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-2xl">
                    <Brain className="w-12 h-12 text-primary" />
                </div>
            </div>

            {status === 'loading' && (
                <>
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Verifying...</h1>
                    <p className="text-white/50">Please wait while we verify your email</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-green-500/20 rounded-full">
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-green-400">Success!</h1>
                    <p className="text-white/50 mb-6">{message}</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent rounded-full font-semibold"
                    >
                        Go to Login
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-red-500/20 rounded-full">
                            <XCircle className="w-12 h-12 text-red-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-red-400">Error</h1>
                    <p className="text-white/50 mb-6">{message}</p>
                    <div className="space-y-3">
                        <Link
                            href="/register"
                            className="block w-full px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-full font-semibold"
                        >
                            Create New Account
                        </Link>
                        <button
                            onClick={() => router.push('/login')}
                            className="block w-full px-6 py-3 border border-white/20 rounded-full"
                        >
                            Go to Login
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

import { useState, useEffect } from 'react'

export default function ConfirmPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
            </div>

            <Suspense fallback={
                <div className="w-full max-w-md z-10 glass-card rounded-3xl p-8 text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Loading...</h1>
                </div>
            }>
                <ConfirmContent />
            </Suspense>
        </div>
    )
}
