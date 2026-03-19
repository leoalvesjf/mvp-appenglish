import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const audio = formData.get('audio') as File

        if (!audio) {
            return NextResponse.json({ error: 'No audio file' }, { status: 400 })
        }

        const t0 = Date.now()
        const transcription = await openai.audio.transcriptions.create({
            file: audio,
            model: 'whisper-1',
        })
        console.log(`[STT - Whisper] ${Date.now() - t0}ms`)

        return NextResponse.json({ text: transcription.text })
    } catch (error) {
        console.error('Transcribe error:', error)
        return NextResponse.json({ error: 'Failed to transcribe' }, { status: 500 })
    }
}