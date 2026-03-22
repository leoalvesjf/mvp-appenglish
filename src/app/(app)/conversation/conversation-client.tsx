'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Loader2, Sparkles, ArrowLeft, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/core'
import { EnglishLevel } from '@/lib/gamification/levels'
import { ScenarioSelector } from '@/components/scenario-selector'
import { ScenarioId, getScenario } from '@/lib/conversation/scenarios'

type Message = {
    role: 'user' | 'assistant'
    content: string
    corrections?: { original: string; corrected: string; explanation: string }[]
}

export default function ConversationClient({
    englishLevel
}: {
    englishLevel: EnglishLevel
}) {
    const [scenario, setScenario] = useState<ScenarioId>('tutor')
    const [showSelector, setShowSelector] = useState(true)
    const [messages, setMessages] = useState<Message[]>([])
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [isConversationComplete, setIsConversationComplete] = useState(false)
    const [isWarningShown, setIsWarningShown] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleReset = () => {
        setMessages([])
        setConversationId(null)
        setIsConversationComplete(false)
        setIsWarningShown(false)
        setShowSelector(true)
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus' : 'audio/mp4'
            const recorder = new MediaRecorder(stream, { mimeType })
            mediaRecorderRef.current = recorder
            chunksRef.current = []
            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
            recorder.start(100)
            setIsRecording(true)
            setRecordingTime(0)
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
        } catch (error) {
            console.error('Failed to start recording:', error)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Microphone access is required for voice conversation. Please allow microphone permissions.' }])
        }
    }

    const stopRecording = (): Promise<Blob> => {
        return new Promise((resolve) => {
            if (timerRef.current) clearInterval(timerRef.current)
            const recorder = mediaRecorderRef.current
            if (!recorder) return resolve(new Blob())
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
                recorder.stream.getTracks().forEach(t => t.stop())
                resolve(blob)
            }
            recorder.stop()
        })
    }

    const handleRecordToggle = async () => {
        if (isRecording) {
            setIsRecording(false)
            setIsProcessing(true)

            const blob = await stopRecording()

            setMessages(prev => [...prev, { role: 'user', content: '...' }])

            const formData = new FormData()
            const audioFileName = blob.type.includes('webm') ? 'audio.webm' : 
                                  blob.type.includes('mp4') ? 'audio.mp4' : 'audio.webm'
            formData.append('audio', blob, audioFileName)
            formData.append('scenario', scenario)
            formData.append('userName', 'Student')
            formData.append('englishLevel', englishLevel)
            if (conversationId) {
                formData.append('conversationId', conversationId)
            }
            const history = messages.map(m => ({ role: m.role, content: m.content }))
            formData.append('history', JSON.stringify(history))

            try {
                const response = await fetch('/api/voice/message', {
                    method: 'POST',
                    body: formData
                })

                const data = await response.json()

                if (data.error) {
                    console.error('Voice API error:', data.error)
                    setMessages(prev => prev.slice(0, -1))
                    setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error. Please try again.' }])
                    setIsProcessing(false)
                    return
                }

                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { role: 'user', content: data.userTranscript || '...' }
                    return updated
                })

                if (data.conversationId && !conversationId) {
                    setConversationId(data.conversationId)
                }

                if (data.isWarning) {
                    setIsWarningShown(true)
                }

                if (data.isComplete) {
                    setIsConversationComplete(true)
                }

                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

                if (data.replyAudio) {
                    const audioBytes = Uint8Array.from(atob(data.replyAudio), c => c.charCodeAt(0))
                    const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' })
                    const audioUrl = URL.createObjectURL(audioBlob)
                    const audio = new Audio(audioUrl)
                    audioRef.current = audio
                    
                    audio.onended = () => {
                        setIsProcessing(false)
                        URL.revokeObjectURL(audioUrl)
                        fetch('/api/track-time', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ minutes: 1 })
                        }).catch(console.error)
                    }
                    
                    audio.onerror = (e) => {
                        console.error('Audio playback error:', e)
                        setIsProcessing(false)
                        URL.revokeObjectURL(audioUrl)
                    }
                    
                    await audio.play()
                } else {
                    setIsProcessing(false)
                }
            } catch (error) {
                console.error('Failed to process voice message:', error)
                setMessages(prev => prev.slice(0, -1))
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error. Please try again.' }])
                setIsProcessing(false)
            }

        } else {
            if (audioRef.current) audioRef.current.pause()
            await startRecording()
        }
    }

    const scenarioData = getScenario(scenario)

    return (
        <div className="flex flex-col h-[100dvh] relative">
            {/* Header */}
            <header className="px-6 pt-6 pb-4 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/dashboard')} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{scenarioData.icon}</span>
                            <Badge variant="primary">{scenarioData.name}</Badge>
                        </div>
                        <h1 className="text-xl font-display font-semibold text-white">Voice Conversation</h1>
                    </div>
                </div>
                <button
                    onClick={() => { setShowSelector(true); setMessages([]); setConversationId(null) }}
                    className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
                    title="Change scenario"
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
            </header>

            {showSelector ? (
                <main className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
                    <ScenarioSelector selected={scenario} onSelect={(id) => { setScenario(id); setShowSelector(false) }} />
                    {messages.length > 0 && (
                        <button
                            onClick={() => setShowSelector(false)}
                            className="mt-6 w-full h-12 border border-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
                        >
                            Resume conversation
                        </button>
                    )}
                </main>
            ) : (
                <main ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 pb-40">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className="max-w-[85%]">
                                    <div className={`p-4 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-sm shadow-lg shadow-primary/20'
                                            : 'bg-white/10 text-white/90 rounded-tl-sm border border-white/5'
                                        }`}>
                                        {msg.content === '...' ? (
                                            <div className="flex space-x-1 py-1">
                                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        ) : (
                                            <p className="leading-relaxed">{msg.content}</p>
                                        )}
                                    </div>

                                    {msg.corrections && msg.corrections.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {msg.corrections.map((corr, cIdx) => (
                                                <div key={cIdx} className="glass-card rounded-2xl p-3 bg-red-500/5 border-red-500/20 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-white/50 line-through decoration-red-500">{corr.original}</p>
                                                            <p className="text-green-400 font-medium mt-0.5">{corr.corrected}</p>
                                                            <p className="text-white/70 text-xs mt-1 italic">{corr.explanation}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </main>
            )}

            {/* Controls */}
            <div className="absolute bottom-6 left-0 right-0 p-6 flex flex-col items-center pointer-events-none">
                {isProcessing && (
                    <div className="mb-4 bg-background/80 backdrop-blur px-4 py-2 rounded-full border border-white/10 flex items-center text-sm text-primary">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing speech...
                    </div>
                )}

                <div className="pointer-events-auto relative">
                    {isRecording && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="absolute -inset-4 rounded-full bg-destructive/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                        </>
                    )}

                    {isConversationComplete ? (
                        <div className="w-80 bg-background/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-5xl">🏆</span>
                                <p className="text-xl font-display font-semibold text-white">Conversa concluída!</p>
                                <div className="flex gap-3 w-full mt-2">
                                    <button
                                        onClick={handleReset}
                                        className="flex-1 h-11 rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Tentar novamente
                                    </button>
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="flex-1 h-11 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                                    >
                                        Ir para o Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isWarningShown && (
                                <div className="mb-4 bg-yellow-500/20 backdrop-blur px-4 py-2 rounded-full border border-yellow-500/30 flex items-center text-sm text-yellow-300">
                                    ⚠️ Última chance! Faça sua resposta final.
                                </div>
                            )}
                            <button
                                onClick={handleRecordToggle}
                                disabled={isConversationComplete || isProcessing}
                                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${isRecording
                                        ? 'bg-destructive shadow-destructive/50 scale-110'
                                        : 'bg-primary shadow-primary/40 hover:scale-105 active:scale-95 disabled:opacity-50'
                                    }`}
                            >
                                {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                            </button>
                        </>
                    )}
                </div>

                {isRecording && (
                    <p className="mt-4 font-mono text-destructive font-medium bg-background/50 px-3 py-1 rounded-full backdrop-blur-md pointer-events-none">
                        0:{recordingTime.toString().padStart(2, '0')}
                    </p>
                )}
            </div>
        </div>
    )
}
