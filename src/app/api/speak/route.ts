import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json()

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 })
        }

        const t0 = Date.now()
        const response = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',
            input: text,
            response_format: 'mp3',
        })
        console.log(`[TTS - Nova] ${Date.now() - t0}ms`)

        const buffer = Buffer.from(await response.arrayBuffer())

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length.toString(),
            },
        })
    } catch (error) {
        console.error('Speak error:', error)
        return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 })
    }
}