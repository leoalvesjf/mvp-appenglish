import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'
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

        const { email, password, name, phone } = await req.json()

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password and name are required' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        const result = await register(email, password, name, phone)

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        if (!result.user || !result.token) {
            return NextResponse.json(
                { error: 'Registration failed' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            token: result.token,
            user: { id: result.user.id, email: result.user.email, name: result.user.name },
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
