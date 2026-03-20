'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, X, ChevronRight, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

type Exercise = {
    id: string
    type: 'multiple_choice' | 'fill_in_blank' | 'drag_and_drop'
    question: string
    options?: string[]
    words?: string[]
    correctAnswer: string
    explanation: string
}

type Lesson = {
    id: number
    title: string
    description: string
    icon: string | null
    xpReward: number | null
    exercises: unknown
    vocabulary: unknown
    correction?: string
}

export default function LessonDetailClient({ lesson }: { lesson: Lesson }) {
    const router = useRouter()
    const exercises = useMemo(() => (lesson.exercises as Exercise[]) || [], [lesson.exercises])
    const [current, setCurrent] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [score, setScore] = useState(0)

    const exercise = exercises[current]

    const handleNext = async () => {
        if (current + 1 >= exercises.length) {
            await fetch('/api/lessons/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    lessonId: lesson.id, 
                    xpReward: lesson.xpReward || 0,
                    score: score,
                    total: exercises.length
                })
            })
            setCompleted(true)
            return
        }
        setCurrent(c => c + 1)
    }

    if (!exercise && !completed) return null

    if (completed) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl mb-6">
                    🏆
                </motion.div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">Lesson Complete!</h1>
                <p className="text-white/50 mb-6">{score}/{exercises.length} correct answers</p>
                <div className="glass-card rounded-3xl p-6 mb-8">
                    <div className="text-4xl font-bold text-primary">+{lesson.xpReward} XP</div>
                    <p className="text-white/50 text-sm mt-1">earned</p>
                </div>
                <button
                    onClick={() => router.push('/lessons')}
                    className="w-full max-w-xs h-12 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl"
                >
                    Back to Path
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="px-6 pt-6 pb-4 flex items-center gap-3">
                <button onClick={() => router.push('/lessons')} className="p-2 rounded-full hover:bg-white/5">
                    <ArrowLeft className="w-5 h-5 text-white/60" />
                </button>
                <div className="flex-1">
                    <div className="flex justify-between text-xs text-white/40 mb-1">
                        <span>{lesson.icon} {lesson.title}</span>
                        <span>{current + 1}/{exercises.length}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                            style={{ width: `${((current + 1) / exercises.length) * 100}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Exercise */}
            <main className="flex-1 p-6">
                <AnimatePresence mode="wait">
                    <ExerciseView
                        key={current}
                        exercise={exercise}
                        current={current}
                        total={exercises.length}
                        lessonId={lesson.id}
                        onCorrect={() => setScore(s => s + 1)}
                        onNext={handleNext}
                    />
                </AnimatePresence>
            </main>
        </div>
    )
}

function ExerciseView({
    exercise,
    current,
    total,
    lessonId,
    onCorrect,
    onNext
}: {
    exercise: Exercise
    current: number
    total: number
    lessonId: number
    onCorrect: () => void
    onNext: () => Promise<void>
}) {
    const [selected, setSelected] = useState<string | null>(null)
    const [fillAnswer, setFillAnswer] = useState('')
    const [dragOrder, setDragOrder] = useState<string[]>([])
    const [dragAvailable, setDragAvailable] = useState<string[]>(() =>
        exercise.type === 'drag_and_drop' && exercise.words
            ? [...exercise.words].sort(() => Math.random() - 0.5)
            : []
    )
    const [checked, setChecked] = useState(false)
    const [correct, setCorrect] = useState(false)

    const handleCheck = async () => {
        let answer = ''
        if (exercise.type === 'multiple_choice') answer = selected || ''
        if (exercise.type === 'fill_in_blank') answer = fillAnswer.trim().toLowerCase()
        if (exercise.type === 'drag_and_drop') answer = dragOrder.join(' ')

        const isCorrect = answer.toLowerCase() === exercise.correctAnswer.toLowerCase()
        setCorrect(isCorrect)
        setChecked(true)
        if (isCorrect) {
            onCorrect()
        } else if (answer) {
            await fetch('/api/vocabulary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    word: answer,
                    correction: exercise.correctAnswer,
                    explanation: exercise.explanation,
                    source: 'lesson',
                    lessonId
                })
            })
        }
    }

    const addWord = (word: string) => {
        setDragOrder(prev => [...prev, word])
        setDragAvailable(prev => {
            const index = prev.indexOf(word)
            return prev.filter((_, i) => i !== index)
        })
    }

    const removeWord = (idx: number) => {
        const word = dragOrder[idx]
        setDragOrder(prev => prev.filter((_, i) => i !== idx))
        setDragAvailable(prev => [...prev, word])
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col"
        >
            <div className="space-y-6 flex-1">
                <h2 className="text-xl font-semibold text-white leading-snug">{exercise.question}</h2>

                {/* Multiple Choice */}
                {exercise.type === 'multiple_choice' && (
                    <div className="space-y-3">
                        {exercise.options?.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => !checked && setSelected(opt)}
                                className={cn(
                                    'w-full p-4 rounded-2xl border text-left transition-all',
                                    checked && opt === exercise.correctAnswer
                                        ? 'border-green-500 bg-green-500/10 text-green-400'
                                        : checked && opt === selected && opt !== exercise.correctAnswer
                                            ? 'border-destructive bg-destructive/10 text-destructive'
                                            : selected === opt
                                                ? 'border-primary bg-primary/10 text-white'
                                                : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'
                                )}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Fill in Blank */}
                {exercise.type === 'fill_in_blank' && (
                    <input
                        type="text"
                        value={fillAnswer}
                        onChange={(e) => !checked && setFillAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className={cn(
                            'w-full h-14 rounded-xl border px-4 text-white bg-black/20 outline-none transition-colors',
                            checked
                                ? correct
                                    ? 'border-green-500'
                                    : 'border-destructive'
                                : 'border-white/10 focus:border-primary'
                        )}
                    />
                )}

                {/* Drag and Drop */}
                {exercise.type === 'drag_and_drop' && (
                    <div className="space-y-4">
                        <div className="min-h-14 p-3 rounded-xl border border-white/10 bg-white/5 flex flex-wrap gap-2">
                            {dragOrder.map((word, i) => (
                                <button
                                    key={i}
                                    onClick={() => !checked && removeWord(i)}
                                    className="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-white text-sm"
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {dragAvailable.map((word, i) => (
                                <button
                                    key={i}
                                    onClick={() => !checked && addWord(word)}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:border-white/20"
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Feedback */}
                {checked && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            'p-4 rounded-2xl border',
                            correct
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-destructive/10 border-destructive/30'
                        )}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {correct
                                ? <Check className="w-5 h-5 text-green-400" />
                                : <X className="w-5 h-5 text-destructive" />
                            }
                            <span className={cn('font-semibold', correct ? 'text-green-400' : 'text-destructive')}>
                                {correct ? 'Correct!' : 'Not quite...'}
                            </span>
                        </div>
                        <p className="text-white/70 text-sm">{exercise.explanation}</p>
                        {!correct && (
                            <p className="text-white/50 text-sm mt-1">
                                Answer: <span className="text-green-400">{exercise.correctAnswer}</span>
                            </p>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Footer inside ExerciseView for scoped state */}
            <div className="pt-6">
                {!checked ? (
                    <button
                        onClick={handleCheck}
                        disabled={
                            (exercise.type === 'multiple_choice' && !selected) ||
                            (exercise.type === 'fill_in_blank' && !fillAnswer.trim()) ||
                            (exercise.type === 'drag_and_drop' && dragOrder.length === 0)
                        }
                        className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl disabled:opacity-30 transition-all"
                    >
                        Check Answer
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                    >
                        {current + 1 >= total ? (
                            <><Trophy className="w-5 h-5" /> Complete Lesson</>
                        ) : (
                            <>Next <ChevronRight className="w-5 h-5" /></>
                        )}
                    </button>
                )}
            </div>
        </motion.div>
    )
}