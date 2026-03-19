import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getMissAnaPrompt } from '@/lib/prompts/miss-ana'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        const { messages, userName, englishLevel } = await request.json()

        const systemPrompt = getMissAnaPrompt({
            name: userName || 'Student',
            englishLevel: englishLevel || 'beginner',
        })

        const t0 = Date.now()
        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 256,
            system: systemPrompt,
            messages,
        })
        console.log(`[LLM - Claude Haiku] ${Date.now() - t0}ms`)

        const reply = response.content[0].type === 'text' ? response.content[0].text : ''

        return NextResponse.json({ reply })
    } catch (error) {
        console.error('Chat error:', error)
        return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
    }
}