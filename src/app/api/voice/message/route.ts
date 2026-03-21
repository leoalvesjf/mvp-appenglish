import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { getMissAnaPrompt } from '@/lib/prompts/miss-ana'
import { getAuthenticatedUser } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { conversations, messages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { checkAndAwardAchievements } from '@/lib/gamification/achievements'
import { getScenario, ScenarioId } from '@/lib/conversation/scenarios'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const t0 = Date.now()

        const formData = await request.formData()
        const audioFile = formData.get('audio') as File | null

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
        }

        const scenarioId = formData.get('scenario') as ScenarioId || 'tutor'
        const userName = formData.get('userName') as string || 'Student'
        const englishLevel = formData.get('englishLevel') as string || 'A1'
        const conversationIdParam = formData.get('conversationId') as string | null
        const historyParam = formData.get('history') as string | null

        let history: { role: string; content: string }[] = []
        if (historyParam) {
            try {
                history = JSON.parse(historyParam)
            } catch { }
        }

        const arrayBuffer = await audioFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const file = new File([buffer], 'audio.webm', { type: 'audio/webm' })

        const t1 = Date.now()
        const transcription = await openai.audio.transcriptions.create({
            model: 'whisper-1',
            file: file,
        })
        console.log(`[STT - Whisper] ${Date.now() - t1}ms`)

        const userTranscript = transcription.text.trim()

        if (!userTranscript) {
            return NextResponse.json({
                userTranscript: '',
                reply: "I couldn't hear you clearly. Could you please try again?",
                replyAudio: null,
                corrections: [],
                conversationId: conversationIdParam,
                newAchievements: [],
            })
        }

        const scenarioData = getScenario(scenarioId)
        const systemPrompt = getMissAnaPrompt({
            name: userName,
            englishLevel,
            scenarioPrompt: scenarioData.promptSuffix,
        })

        const chatMessages = [
            ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
            { role: 'user' as const, content: userTranscript }
        ]

        const t2 = Date.now()
        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 256,
            system: systemPrompt,
            messages: chatMessages,
        })
        console.log(`[LLM - Claude Haiku] ${Date.now() - t2}ms`)

        const reply = response.content[0].type === 'text' ? response.content[0].text : ''

        let currentConversationId = conversationIdParam

        if (!conversationIdParam) {
            const [newConversation] = await db.insert(conversations)
                .values({
                    userId: user.id,
                    messageCount: 2,
                    scenario: scenarioId,
                })
                .returning()
            currentConversationId = newConversation.id

            await db.insert(messages).values([
                { conversationId: currentConversationId, role: 'user', content: userTranscript },
                { conversationId: currentConversationId, role: 'assistant', content: reply },
            ])
        } else {
            await db.insert(messages).values([
                { conversationId: conversationIdParam, role: 'user', content: userTranscript },
                { conversationId: conversationIdParam, role: 'assistant', content: reply },
            ])

            await db.update(conversations)
                .set({ messageCount: 2 })
                .where(eq(conversations.id, conversationIdParam))
        }

        const newAchievements = await checkAndAwardAchievements(user.id)

        let replyAudioBase64: string | null = null

        const t3 = Date.now()
        try {
            const mp3 = await openai.audio.speech.create({
                model: 'tts-1',
                voice: 'nova',
                input: reply,
                response_format: 'mp3',
            })
            console.log(`[TTS - Nova] ${Date.now() - t3}ms`)

            const audioBuffer = Buffer.from(await mp3.arrayBuffer())
            replyAudioBase64 = audioBuffer.toString('base64')
        } catch (ttsError) {
            console.error('[TTS] Error:', ttsError)
        }

        console.log(`[TOTAL] ${Date.now() - t0}ms`)

        return NextResponse.json({
            userTranscript,
            reply,
            replyAudio: replyAudioBase64,
            corrections: [],
            conversationId: currentConversationId,
            newAchievements,
        })
    } catch (error) {
        console.error('[Voice Message] Error:', error)
        return NextResponse.json({ error: 'Failed to process voice message' }, { status: 500 })
    }
}
