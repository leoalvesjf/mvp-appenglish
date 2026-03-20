'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Map, Mic, BookOpen, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthGuard } from './AuthGuard'

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/lessons', icon: Map, label: 'Path' },
    { href: '/conversation', icon: Mic, label: 'Tutor', primary: true },
    { href: '/vocabulary', icon: BookOpen, label: 'Words' },
    { href: '/profile', icon: User, label: 'Profile' },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex justify-center w-full min-h-screen bg-black sm:bg-zinc-950">
            <div className="w-full sm:max-w-md bg-background relative flex flex-col min-h-[100dvh] sm:border-x border-white/5 sm:shadow-2xl overflow-hidden">

                {/* Abstract Background Effect */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden z-10 pb-24 relative">
                    <AuthGuard>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </AuthGuard>
                </main>

                {/* Bottom Navigation */}
                <nav className="absolute bottom-0 w-full z-50 px-4 pb-6 pt-4 bg-gradient-to-t from-background via-background to-transparent">
                    <div className="glass rounded-full px-2 py-2 flex items-center justify-between shadow-2xl shadow-primary/10">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                            const Icon = item.icon

                            if (item.primary) {
                                return (
                                    <Link href={item.href} key={item.href} className="relative -mt-8 mx-2">
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95",
                                            isActive
                                                ? "bg-gradient-to-tr from-primary to-accent shadow-primary/40"
                                                : "bg-zinc-800 border border-white/10"
                                        )}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                    </Link>
                                )
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex-1 flex flex-col items-center justify-center py-2"
                                >
                                    <Icon className={cn(
                                        "w-6 h-6 transition-colors duration-300",
                                        isActive ? "text-primary" : "text-white/40 hover:text-white/70"
                                    )} />
                                    <span className={cn(
                                        "text-[10px] mt-1 font-medium transition-colors duration-300",
                                        isActive ? "text-primary" : "text-white/40"
                                    )}>
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </div>
        </div>
    )
}