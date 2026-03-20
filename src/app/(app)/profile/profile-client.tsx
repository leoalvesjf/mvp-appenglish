'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, Star, Award, Flame, BookOpen, MessageSquare, Settings } from 'lucide-react'
import Link from 'next/link'

export default function ProfileClient() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="p-6 pb-32">
            <header className="mb-8 mt-6">
                <h1 className="text-3xl font-display font-bold text-white">Profile</h1>
                <p className="text-white/50">Manage your account</p>
            </header>

            <div className="space-y-4">
                <Link href="/conversations" className="flex items-center gap-4 p-4 glass-card rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="p-3 rounded-xl bg-primary/20 text-primary">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-medium">Conversations</h3>
                        <p className="text-white/40 text-sm">View your chat history</p>
                    </div>
                </Link>

                <Link href="/vocabulary" className="flex items-center gap-4 p-4 glass-card rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="p-3 rounded-xl bg-accent/20 text-accent">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-medium">My Vocabulary</h3>
                        <p className="text-white/40 text-sm">Words you have learned</p>
                    </div>
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 glass-card rounded-2xl hover:bg-destructive/10 transition-colors"
                >
                    <div className="p-3 rounded-xl bg-destructive/20 text-destructive">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="text-destructive font-medium">Log Out</h3>
                        <p className="text-white/40 text-sm">Sign out of your account</p>
                    </div>
                </button>
            </div>
        </div>
    )
}