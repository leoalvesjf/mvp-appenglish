import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedUser } from '@/lib/auth/helpers'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
    console.error('[TTS] OPENAI_API_KEY is not configured')
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const user = await getAuthenticatedUser()
        if (!user) {
            console.log('[TTS] Unauthorized - no user')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[TTS] Request received from user:', user.id)
        const body = await request.json()
        console.log('[TTS] Body:', body)
        const { text } = body

        if (!text) {
            console.log('[TTS] No text provided')
            return NextResponse.json({ error: 'No text provided' }, { status: 400 })
        }

        // OpenAI TTS has a limit of 4096 characters
        if (text.length > 4096) {
            console.log('[TTS] Text too long:', text.length)
            return NextResponse.json({ error: 'Text too long (max 4096 characters)' }, { status: 400 })
        }

        console.log('[TTS] Calling OpenAI API with text:', text.substring(0, 50) + '...', 'length:', text.length)
        console.log('[TTS] Request params:', {
            model: 'tts-1',
            voice: 'nova',
            inputLength: text.length,
            response_format: 'mp3'
        })
        
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',
            input: text,
            response_format: 'mp3',
        })
        
        console.log('[TTS] Response status:', mp3.status)

        console.log('[TTS] OpenAI API response received')
        const buffer = Buffer.from(await mp3.arrayBuffer())
        console.log('[TTS] Buffer length:', buffer.length)

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length.toString(),
            },
        })
    } catch (error) {
        console.error('[TTS] Error:', error)
        if (error instanceof Error) {
            console.error('[TTS] Error message:', error.message)
            console.error('[TTS] Error stack:', error.stack)
            // Check if it's an OpenAI API error
            if (error.message.includes('400') || error.message.includes('Bad Request')) {
                console.error('[TTS] OpenAI API returned 400')
                return NextResponse.json({ error: 'Bad request to OpenAI API: ' + error.message }, { status: 400 })
            }
        }
        return NextResponse.json({ error: 'Speech generation failed' }, { status: 500 })
    }
}
