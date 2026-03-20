import { NextResponse } from 'next/server'
import { confirmEmail } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const { token } = await req.json()

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            )
        }

        const result = await confirmEmail(token)

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully! You can now login.',
        })
    } catch (error) {
        console.error('Confirm email error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
