import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { conversations, messages } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import ConversationsClient from './conversations-client'
import { getAuthenticatedUser } from '@/lib/auth/helpers'

export default async function ConversationsHistoryPage() {
    const user = await getAuthenticatedUser()

    if (!user) redirect('/login')

    const userConversations = await db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, user.id))
        .orderBy(desc(conversations.startedAt))

    const conversationsWithMessages = await Promise.all(
        userConversations.map(async (conv) => {
            const convMessages = await db
                .select()
                .from(messages)
                .where(eq(messages.conversationId, conv.id))
                .orderBy(messages.createdAt)
            
            const firstMessage = convMessages[0]?.content?.substring(0, 50) || 'New conversation'
            const lastMessage = convMessages[convMessages.length - 1]?.content?.substring(0, 50) || ''
            
            return {
                ...conv,
                firstMessage,
                lastMessage,
                messageCount: convMessages.length
            }
        })
    )

    return <ConversationsClient conversations={conversationsWithMessages} />
}