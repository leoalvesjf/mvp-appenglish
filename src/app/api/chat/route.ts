import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getMissAnaPrompt } from '@/lib/prompts/miss-ana'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { conversations, messages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { messages: chatMessages, userName, englishLevel, conversationId } = await request.json()

        const systemPrompt = getMissAnaPrompt({
            name: userName || 'Student',
            englishLevel: englishLevel || 'beginner',
        })

        const t0 = Date.now()
        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 256,
            system: systemPrompt,
            messages: chatMessages,
        })
        console.log(`[LLM - Claude Haiku] ${Date.now() - t0}ms`)

        const reply = response.content[0].type === 'text' ? response.content[0].text : ''

        let currentConversationId = conversationId

        if (!conversationId) {
            const [newConversation] = await db.insert(conversations)
                .values({
                    userId: user.id,
                    messageCount: 2,
                })
                .returning()
            currentConversationId = newConversation.id

            await db.insert(messages).values([
                {
                    conversationId: currentConversationId,
                    role: 'user',
                    content: chatMessages[chatMessages.length - 1]?.content || '',
                },
                {
                    conversationId: currentConversationId,
                    role: 'assistant',
                    content: reply,
                },
            ])
        } else {
            await db.insert(messages).values([
                {
                    conversationId,
                    role: 'user',
                    content: chatMessages[chatMessages.length - 1]?.content || '',
                },
                {
                    conversationId,
                    role: 'assistant',
                    content: reply,
                },
            ])

            await db.update(conversations)
                .set({ messageCount: 2 })
                .where(eq(conversations.id, currentConversationId))
        }

        return NextResponse.json({ reply, conversationId: currentConversationId })
    } catch (error) {
        console.error('Chat error:', error)
        return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
    }
}