import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(req: Request) {
    try {
        const ip = getClientIP(req)
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429 }
            )
        }

        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const result = await login(email, password)

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 401 }
            )
        }

        const response = NextResponse.json({
            success: true,
            user: result.user,
        })

        response.cookies.set('auth_token', result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        })

        return response
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
