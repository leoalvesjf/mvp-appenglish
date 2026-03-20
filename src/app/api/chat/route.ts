import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getMissAnaPrompt } from '@/lib/prompts/miss-ana'
import { getAuthenticatedUser } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { conversations, messages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { checkAndAwardAchievements } from '@/lib/gamification/achievements'
import { getScenario, ScenarioId } from '@/lib/conversation/scenarios'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { messages: chatMessages, userName, englishLevel, conversationId, scenario } = await request.json()

        const scenarioData = getScenario((scenario as ScenarioId) || 'tutor')
        const systemPrompt = getMissAnaPrompt({
            name: userName || 'Student',
            englishLevel: englishLevel || 'A1',
            scenarioPrompt: scenarioData.promptSuffix,
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
                    scenario: (scenario as ScenarioId) || 'tutor',
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

        const newAchievements = await checkAndAwardAchievements(user.id)

        return NextResponse.json({
            reply,
            conversationId: currentConversationId,
            newAchievements,
        })
    } catch (error) {
        console.error('Chat error:', error)
        return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
    }
}