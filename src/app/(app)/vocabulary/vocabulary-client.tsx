'use client'

import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'

type VocabItem = {
    id: string
    word: string
    correction: string
    explanation: string | null
    source: string | null
    createdAt: Date | null
}

export default function VocabularyClient({ vocabulary }: { vocabulary: VocabItem[] }) {
    const [expanded, setExpanded] = useState<string | null>(null)

    return (
        <div className="p-6 pb-32">
            <header className="mb-8 mt-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white">My Vocabulary</h1>
                </div>
                <p className="text-white/50">Words you have learned from mistakes</p>
            </header>

            {vocabulary.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No vocabulary yet</h3>
                    <p className="text-white/50">Complete lessons to add words to your vocabulary</p>
                    <Link href="/lessons" className="inline-block mt-4 text-primary hover:underline">
                        Go to Lessons →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {vocabulary.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                'glass-card rounded-2xl overflow-hidden transition-all',
                                expanded === item.id ? 'bg-white/10' : 'bg-white/5'
                            )}
                        >
                            <button
                                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                                className="w-full p-4 text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-destructive line-through text-lg font-medium">
                                            {item.word}
                                        </span>
                                        <span className="text-white/30 mx-2">→</span>
                                        <span className="text-green-400 text-lg font-medium">
                                            {item.correction}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs text-white/40 mt-2">
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''} • {item.source || 'lesson'}
                                </div>
                            </button>
                            
                            {expanded === item.id && item.explanation && (
                                <div className="px-4 pb-4 border-t border-white/5">
                                    <p className="text-white/70 text-sm mt-3">{item.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}