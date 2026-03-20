'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))
        if (token) {
            router.push('/dashboard')
        }
    }, [router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleRegister = async () => {
        if (!formData.email || !formData.password || !formData.name) {
            setError('Please fill in all fields')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Registration failed')
                setLoading(false)
                return
            }

            setSuccess(true)
        } catch {
            setError('An error occurred. Please try again.')
        }

        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
                </div>

                <div className="w-full max-w-md z-10 glass-card rounded-3xl p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-green-500/20 rounded-full">
                            <Mail className="w-12 h-12 text-green-400" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Check your email!</h1>
                    <p className="text-white/50 mb-6">
                        We sent a confirmation link to <strong className="text-white">{formData.email}</strong>
                    </p>

                    <div className="bg-white/5 rounded-xl p-4 mb-6 text-sm text-white/60">
                        <p>Click the link in your email to activate your account.</p>
                    </div>

                    <button
                        onClick={() => router.push('/login')}
                        className="w-full py-3 border border-white/20 rounded-full hover:bg-white/5 transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
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
                            Create Account
                        </h1>
                        <p className="text-white/50 mt-1">Sign up to start learning</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {[
                        { name: 'name', type: 'text', placeholder: 'Full Name' },
                        { name: 'phone', type: 'tel', placeholder: 'Phone Number (optional)' },
                        { name: 'email', type: 'email', placeholder: 'Email address' },
                        { name: 'password', type: 'password', placeholder: 'Password (min 6 characters)' },
                    ].map((field) => (
                        <input
                            key={field.name}
                            name={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.name as keyof typeof formData]}
                            onChange={handleChange}
                            className="flex w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors h-12"
                        />
                    ))}

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
                    </button>
                </div>

                <p className="text-center text-sm text-white/40 mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
