import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'

export async function POST(req: Request) {
    try {
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

        return NextResponse.json({
            success: true,
            message: 'Account created! Please check your email to verify your account.',
        })
    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
