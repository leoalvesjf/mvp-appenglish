'use client'

import { motion } from 'framer-motion'
import { Check, Lock, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Lesson = {
    id: number
    title: string
    category: string
    isLocked: boolean
    isCompleted: boolean
    xpReward: number | null
    order: number | null
}

export default function LessonsClient({ lessons }: { lessons: Lesson[] }) {
    return (
        <div className="p-6 pb-32">
            <header className="mb-10 text-center mt-6">
                <h1 className="text-3xl font-display font-bold text-white mb-2">Learning Path</h1>
                <p className="text-white/50">Follow the path to fluency</p>
            </header>

            <div className="relative max-w-[280px] mx-auto">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-white/5 rounded-full z-0" />

                {lessons.map((lesson, i) => {
                    const isLeft = i % 2 === 0
                    const statusColor = lesson.isCompleted
                        ? 'bg-green-500'
                        : lesson.isLocked
                            ? 'bg-white/10'
                            : 'bg-primary'

                    return (
                        <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                'relative flex items-center mb-16 z-10 w-full',
                                isLeft ? 'justify-start' : 'justify-end'
                            )}
                        >
                            <Link href={lesson.isLocked ? '#' : `/lessons/${lesson.id}`}>
                                <div className={cn(
                                    'relative group cursor-pointer',
                                    lesson.isLocked && 'opacity-50 grayscale cursor-not-allowed'
                                )}>
                                    {!lesson.isCompleted && !lesson.isLocked && (
                                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                    )}

                                    <div className={cn(
                                        'w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-transform group-hover:scale-105',
                                        lesson.isCompleted
                                            ? 'border-green-500/30 bg-green-500/20 shadow-green-500/20'
                                            : lesson.isLocked
                                                ? 'border-white/5 bg-zinc-900'
                                                : 'border-primary/50 bg-primary/20 shadow-primary/30'
                                    )}>
                                        <div className={cn(
                                            'w-14 h-14 rounded-full flex items-center justify-center text-white',
                                            statusColor
                                        )}>
                                            {lesson.isCompleted ? (
                                                <Check className="w-6 h-6" />
                                            ) : lesson.isLocked ? (
                                                <Lock className="w-6 h-6" />
                                            ) : (
                                                <Play className="w-6 h-6 ml-1" />
                                            )}
                                        </div>
                                    </div>

                                    <div className={cn(
                                        'absolute top-1/2 -translate-y-1/2 w-32',
                                        isLeft ? 'left-24 text-left' : 'right-24 text-right'
                                    )}>
                                        <h3 className="font-semibold text-white leading-tight">{lesson.title}</h3>
                                        <p className="text-xs text-white/50 mt-1 capitalize">{lesson.category}</p>
                                        {!lesson.isLocked && (
                                            <span className="inline-block mt-1 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
                                                +{lesson.xpReward} XP
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}