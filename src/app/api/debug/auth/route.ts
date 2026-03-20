import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    const result: Record<string, unknown> = {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 50) + '...' : null,
        jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!)
            result.tokenValid = true
            result.tokenDecoded = decoded
        } catch (e: unknown) {
            result.tokenValid = false
            result.tokenError = (e as Error).message
        }
    }

    return NextResponse.json(result)
}
