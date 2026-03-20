import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
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

        const cookieStore = await cookies()
        cookieStore.set('auth_token', result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        })

        return NextResponse.json({
            success: true,
            user: result.user,
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
