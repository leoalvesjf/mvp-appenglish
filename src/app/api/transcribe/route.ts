import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedUser } from '@/lib/auth/helpers'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const user = await getAuthenticatedUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const audioFile = formData.get('audio') as File | null

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
        }

        const arrayBuffer = await audioFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const file = new File([buffer], audioFile.name || 'audio.webm', { type: audioFile.type || 'audio/webm' })

        const transcription = await openai.audio.transcriptions.create({
            model: 'whisper-1',
            file: file,
        })

        return NextResponse.json({ text: transcription.text })
    } catch (error) {
        console.error('Transcription error:', error)
        if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
        }
        return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
    }
}
