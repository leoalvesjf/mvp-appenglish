import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function GET() {
    const results = {
        timestamp: new Date().toISOString(),
        openai: { status: 'unknown', error: null as string | null, latency: null as number | null },
        anthropic: { status: 'unknown', error: null as string | null, latency: null as number | null },
    }

    if (!process.env.OPENAI_API_KEY) {
        results.openai.status = 'missing_key'
        results.openai.error = 'OPENAI_API_KEY not configured'
    } else {
        try {
            const t0 = Date.now()
            await openai.models.list()
            results.openai.status = 'connected'
            results.openai.latency = Date.now() - t0
        } catch (error: any) {
            results.openai.status = 'error'
            results.openai.error = error.message || String(error)
        }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        results.anthropic.status = 'missing_key'
        results.anthropic.error = 'ANTHROPIC_API_KEY not configured'
    } else {
        try {
            const t0 = Date.now()
            await anthropic.models.list()
            results.anthropic.status = 'connected'
            results.anthropic.latency = Date.now() - t0
        } catch (error: any) {
            results.anthropic.status = 'error'
            results.anthropic.error = error.message || String(error)
        }
    }

    const allConnected = results.openai.status === 'connected' && results.anthropic.status === 'connected'
    return NextResponse.json(results, { status: allConnected ? 200 : 503 })
}