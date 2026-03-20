import { NextResponse } from 'next/server'
import { resendConfirmation } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const result = await resendConfirmation(email)

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Confirmation email sent! Check your inbox.',
        })
    } catch (error) {
        console.error('Resend confirmation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
