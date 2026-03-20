'use client'

import { useEffect, useState } from 'react'
import { Trophy, Target, Check, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { UserMission } from '@/lib/gamification/definitions'
import { ACHIEVEMENTS } from '@/lib/gamification/definitions'

interface DailyMissionsProps {
    userId: string
}

export function DailyMissions({ userId }: DailyMissionsProps) {
    const [missions, setMissions] = useState<UserMission[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMissions()
    }, [userId])

    const fetchMissions = async () => {
        try {
            const res = await fetch('/api/daily-missions')
            const data = await res.json()
            setMissions(data.missions || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const completedCount = missions.filter(m => m.completed).length

    return (
        <div className="glass-card rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-white">Daily Missions</h3>
                </div>
                <span className="text-sm text-white/50">
                    {completedCount}/{missions.length}
                </span>
            </div>

            {loading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                </div>
            ) : (
                <div className="space-y-3">
                    {missions.map((mission, idx) => (
                        <motion.div
                            key={mission.type}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                                mission.completed
                                    ? 'bg-green-500/10 border border-green-500/20'
                                    : 'bg-white/5 border border-white/5'
                            }`}
                        >
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                mission.completed
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-primary/20 text-primary'
                            }`}>
                                {mission.completed ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span className="text-xs font-bold">{mission.current}/{mission.target}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                    mission.completed ? 'text-green-400 line-through' : 'text-white'
                                }`}>
                                    {mission.title}
                                </p>
                                <p className="text-xs text-white/40 truncate">{mission.description}</p>
                            </div>
                            <span className="shrink-0 text-xs font-medium text-primary/80">
                                +{mission.xpReward} XP
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}

            {completedCount === missions.length && missions.length > 0 && (
                <div className="mt-4 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                    <p className="text-sm font-semibold text-yellow-400">
                        All missions complete! +50 bonus XP
                    </p>
                </div>
            )}
        </div>
    )
}

interface AchievementsProps {
    unlockedIds: string[]
}

export function AchievementsGrid({ unlockedIds }: AchievementsProps) {
    return (
        <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Achievements</h3>
                <span className="ml-auto text-sm text-white/50">
                    {unlockedIds.length}/{ACHIEVEMENTS.length}
                </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {ACHIEVEMENTS.map(a => {
                    const unlocked = unlockedIds.includes(a.id)
                    return (
                        <div
                            key={a.id}
                            className={`flex flex-col items-center p-3 rounded-2xl text-center transition-all ${
                                unlocked
                                    ? 'bg-yellow-500/10 border border-yellow-500/20'
                                    : 'bg-white/5 border border-white/5 opacity-40'
                            }`}
                        >
                            <span className="text-2xl mb-1">{a.icon}</span>
                            <p className={`text-xs font-medium leading-tight ${
                                unlocked ? 'text-white' : 'text-white/40'
                            }`}>
                                {a.name}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
