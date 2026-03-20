'use client'

import { MessageSquare, Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ConversationWithMessages = {
    id: string
    startedAt: Date | null
    messageCount: number
    firstMessage: string
    lastMessage: string
}

export default function ConversationsClient({ conversations }: { conversations: ConversationWithMessages[] }) {
    const router = useRouter()

    return (
        <div className="p-6 pb-32">
            <header className="mb-8 mt-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white">Conversations</h1>
                </div>
                <p className="text-white/50">Your conversation history with Miss Ana</p>
            </header>

            {conversations.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No conversations yet</h3>
                    <p className="text-white/50 mb-6">Start a voice conversation with Miss Ana</p>
                    <button
                        onClick={() => router.push('/conversation')}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl"
                    >
                        Start Conversation
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => router.push(`/conversation?chat=${conv.id}`)}
                            className="w-full glass-card rounded-2xl p-4 text-left hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                                        <Clock className="w-3 h-3" />
                                        {conv.startedAt ? new Date(conv.startedAt).toLocaleDateString() : ''}
                                        <span>•</span>
                                        <span>{conv.messageCount} messages</span>
                                    </div>
                                    <p className="text-white font-medium truncate">
                                        {conv.firstMessage}
                                    </p>
                                    {conv.lastMessage && conv.lastMessage !== conv.firstMessage && (
                                        <p className="text-white/50 text-sm truncate mt-1">
                                            {conv.lastMessage}
                                        </p>
                                    )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/30 ml-2 shrink-0" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}