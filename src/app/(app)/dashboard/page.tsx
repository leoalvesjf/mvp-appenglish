import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userProgress, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { Flame, Star, Activity, GraduationCap, ArrowRight, Award } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const firstName = user.user_metadata?.name?.split(' ')[0] || 'User'

    const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, user.id)
    })

    const userData = await db.query.users.findFirst({
        where: eq(users.id, user.id)
    })

    const englishLevel = userData?.englishLevel || 'beginner'
    const streak = progress?.currentStreak || 0
    const totalXp = progress?.totalXp || 0
    const totalConversations = progress?.totalConversations || 0

    const getLevelLabel = (level: string) => {
        const labels: Record<string, string> = {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced'
        }
        return labels[level] || 'Beginner'
    }

    const getLevelColor = (level: string) => {
        const colors: Record<string, string> = {
            beginner: 'text-green-400',
            intermediate: 'text-yellow-400',
            advanced: 'text-primary'
        }
        return colors[level] || 'text-green-400'
    }

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center mt-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">
                        Hello, {firstName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Award className={`w-4 h-4 ${getLevelColor(englishLevel)}`} />
                        <span className={`text-sm font-medium ${getLevelColor(englishLevel)}`}>
                            {getLevelLabel(englishLevel)}
                        </span>
                        <Link href="/placement-test" className="text-white/40 hover:text-white text-xs">
                            (Retest)
                        </Link>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-primary font-bold text-lg">
                    {firstName[0].toUpperCase()}
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-3xl p-5 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Streak</p>
                            <p className="text-2xl font-bold text-white">
                                {streak} <span className="text-base font-normal text-white/40">days</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-5 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Total XP</p>
                            <p className="text-2xl font-bold text-white">{totalXp}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Goal */}
            <div className="glass-card rounded-3xl p-6">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Daily Goal</h3>
                        <p className="text-sm text-white/50">{progress?.todayMinutes || 0} / 10 mins</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-primary/20 text-primary border-primary/30">
                        {Math.min(((progress?.todayMinutes || 0) / 10) * 100, 100)}%
                    </span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${Math.min(((progress?.todayMinutes || 0) / 10) * 100, 100)}%` }} />
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
                    <Activity className="w-4 h-4" />
                    <span>Keep your streak to earn bonus XP!</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4">
                <Link href="/conversation" className="block">
                    <div className="glass-card rounded-3xl p-5 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                                        Start Voice Session
                                    </h3>
                                    <p className="text-sm text-white/50">Practice speaking naturally</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </Link>

                <Link href="/placement-test" className="block">
                    <div className="glass-card rounded-3xl p-5 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-yellow-500/20 text-yellow-400 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-300 transition-colors">
                                        Level Test
                                    </h3>
                                    <p className="text-sm text-white/50">Find your level: A1 → C2</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-yellow-400 transition-colors" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Weekly Activity */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Weekly Activity (XP)</h3>
                <div className="flex items-end justify-between gap-2 h-24">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-primary/20 rounded-t-sm" style={{ height: '8px' }} />
                            <span className="text-[10px] text-white/40">{day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}