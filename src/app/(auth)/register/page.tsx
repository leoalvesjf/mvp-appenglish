'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Loader2, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                router.push('/dashboard')
            } else {
                setLoading(false)
            }
        })
    }, [router, supabase])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleRegister = async () => {
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: { data: { name: formData.name, phone: formData.phone } }
        })
        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }
        router.push('/dashboard')
        router.refresh()
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
                        <p className="text-white/50 mt-1">Sign up to practice and track your progress</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {[
                        { name: 'name', type: 'text', placeholder: 'Full Name' },
                        { name: 'phone', type: 'tel', placeholder: 'Phone Number' },
                        { name: 'email', type: 'email', placeholder: 'Email address' },
                        { name: 'password', type: 'password', placeholder: 'Password (minimum 6 characters)' },
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
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign Up'}
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