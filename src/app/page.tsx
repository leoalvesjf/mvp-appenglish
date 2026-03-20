import Link from 'next/link'
import { Brain, Mic, BookOpen, Trophy, ArrowRight, Star } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
            </div>

            <header className="relative z-10 px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-display font-bold">Miss Ana</span>
                </div>
                <div className="flex gap-3">
                    <Link href="/login" className="px-4 py-2 text-white/70 hover:text-white transition-colors">
                        Sign In
                    </Link>
                    <Link href="/register" className="px-5 py-2 bg-gradient-to-r from-primary to-accent rounded-full font-medium hover:opacity-90 transition-opacity">
                        Get Started
                    </Link>
                </div>
            </header>

            <main className="relative z-10 px-6 py-16 max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-8">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>AI-Powered English Tutor</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
                    Learn English with{' '}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Your AI Tutor
                    </span>
                </h1>

                <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
                    Practice speaking English with Miss Ana. Get instant corrections, 
                    track your progress, and unlock your potential.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link 
                        href="/register" 
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-full font-semibold text-lg hover:scale-105 transition-transform"
                    >
                        Start Learning Free <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link 
                        href="/login" 
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg border border-white/20 hover:bg-white/5 transition-colors"
                    >
                        I already have an account
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6 text-left">
                    <div className="glass-card rounded-3xl p-6">
                        <div className="p-3 rounded-xl bg-primary/20 text-primary w-fit mb-4">
                            <Mic className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Voice Practice</h3>
                        <p className="text-white/50">
                            Speak naturally and get real-time feedback from our AI tutor
                        </p>
                    </div>

                    <div className="glass-card rounded-3xl p-6">
                        <div className="p-3 rounded-xl bg-accent/20 text-accent w-fit mb-4">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Structured Learning</h3>
                        <p className="text-white/50">
                            Follow a personalized path with lessons designed for your level
                        </p>
                    </div>

                    <div className="glass-card rounded-3xl p-6">
                        <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400 w-fit mb-4">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                        <p className="text-white/50">
                            Earn XP, maintain streaks, and unlock achievements as you improve
                        </p>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 px-6 py-8 text-center text-white/30 text-sm border-t border-white/5">
                <p>© 2026 Miss Ana. Learn English the smart way.</p>
            </footer>
        </div>
    )
}