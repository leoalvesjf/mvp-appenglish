'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Trophy, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EnglishLevel, LEVEL_INFO, getLevelFromScore, getNextLevel } from '@/lib/gamification/levels'

type Question = {
    id: number
    question: string
    options: unknown[]
    correctAnswer: string
    explanation: string | null
    level: string
}

export default function PlacementTestClient({ questions }: { questions: Question[] }) {
    const router = useRouter()
    const [current, setCurrent] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [checked, setChecked] = useState(false)
    const [answers, setAnswers] = useState<string[]>([])
    const [finished, setFinished] = useState(false)
    const [result, setResult] = useState<{ level: EnglishLevel; score: number } | null>(null)

    const question = questions[current]
    const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0

    const handleSelect = (option: string) => {
        if (!checked) setSelected(option)
    }

    const handleCheck = () => {
        setChecked(true)
        setAnswers([...answers, selected!])
    }

    const handleNext = async () => {
        if (current + 1 >= questions.length) {
            const score = answers.filter((a, i) => a === questions[i].correctAnswer).length + (selected === question.correctAnswer ? 1 : 0)
            const totalAnswers = answers.length + 1
            
            const level = getLevelFromScore(score, totalAnswers)

            await fetch('/api/placement-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, score, total: totalAnswers })
            })

            setResult({ level, score })
            setFinished(true)
            return
        }

        setCurrent(c => c + 1)
        setSelected(null)
        setChecked(false)
    }

    const getLevelLabel = (lvl: EnglishLevel) => LEVEL_INFO[lvl].label
    const getLevelColor = (lvl: EnglishLevel) => `${LEVEL_INFO[lvl].color} ${LEVEL_INFO[lvl].bgColor} ${LEVEL_INFO[lvl].borderColor}`

    if (finished && result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="text-8xl mb-6"
                >
                    🎯
                </motion.div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">Level Test Complete!</h1>
                <p className="text-white/50 mb-6">{result.score}/{questions.length} correct answers</p>
                
                <div className={cn(
                    'glass-card rounded-3xl p-6 mb-6 border-2',
                    getLevelColor(result.level)
                )}>
                    <div className="text-sm text-white/60 mb-1">Your Level</div>
                    <div className="text-3xl font-bold">{getLevelLabel(result.level)}</div>
                    <p className="text-white/50 text-sm mt-2">{LEVEL_INFO[result.level].description}</p>
                </div>

                {getNextLevel(result.level) && (
                    <div className="glass-card rounded-3xl p-4 mb-8 border border-white/10">
                        <p className="text-sm text-white/50 mb-1">Next level</p>
                        <div className="text-lg font-semibold text-white">
                            {getLevelLabel(getNextLevel(result.level)!)}
                        </div>
                        <p className="text-white/40 text-xs mt-1">Earn {500} XP to advance</p>
                    </div>
                )}

                <button
                    onClick={() => router.push('/lessons')}
                    className="w-full max-w-xs h-14 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                    Start Learning <ChevronRight className="w-5 h-5" />
                </button>

                <button
                    onClick={() => {
                        setFinished(false)
                        setResult(null)
                        setCurrent(0)
                        setSelected(null)
                        setChecked(false)
                        setAnswers([])
                    }}
                    className="mt-4 text-white/50 hover:text-white text-sm flex items-center gap-1"
                >
                    <RefreshCw className="w-4 h-4" /> Retry Test
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="px-6 pt-6 pb-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl font-display font-bold text-white">Level Test</h1>
                        <p className="text-white/50 text-sm">Find your English level</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{current + 1}</div>
                        <div className="text-xs text-white/40">of {questions.length}</div>
                    </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            <main className="flex-1 p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-semibold text-white leading-snug">
                            {question.question}
                        </h2>

                        <div className="space-y-3">
                            {(question.options as string[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleSelect(option)}
                                    disabled={checked}
                                    className={cn(
                                        'w-full p-4 rounded-2xl border text-left transition-all',
                                        checked && option === question.correctAnswer
                                            ? 'border-green-500 bg-green-500/10 text-green-400'
                                            : checked && option === selected && option !== question.correctAnswer
                                                ? 'border-destructive bg-destructive/10 text-destructive'
                                                : selected === option
                                                    ? 'border-primary bg-primary/10 text-white'
                                                    : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20',
                                        checked && 'cursor-default'
                                    )}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {checked && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-2xl bg-white/5 border border-white/10"
                            >
                                <p className="text-white/70 text-sm">{question.explanation}</p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            <div className="p-6 pt-0">
                {!checked ? (
                    <button
                        onClick={handleCheck}
                        disabled={!selected}
                        className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl disabled:opacity-30 transition-all"
                    >
                        Check Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                    >
                        {current + 1 >= questions.length ? (
                            <>Finish Test <Trophy className="w-5 h-5" /></>
                        ) : (
                            <>Next <ChevronRight className="w-5 h-5" /></>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}