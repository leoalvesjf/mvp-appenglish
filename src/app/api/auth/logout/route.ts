import { NextResponse } from 'next/server'
import { logout } from '@/lib/auth'

export async function POST() {
    try {
        const token = 'logout'

        await logout(token)

        const response = NextResponse.json({ success: true })
        response.cookies.delete('auth_token')

        return response
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
