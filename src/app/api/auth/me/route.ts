import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const authToken = cookieStore.get('auth_token')
        
        console.log('[auth/me] Cookies received:', {
            hasToken: !!authToken,
            tokenPrefix: authToken?.value?.substring(0, 30),
            allCookies: cookieStore.getAll().map(c => c.name)
        })

        const user = await getCurrentUser()

        console.log('[auth/me] User:', user)

        if (!user) {
            return NextResponse.json({ 
                user: null, 
                debug: { 
                    hasCookie: !!authToken,
                    reason: 'No user found or invalid token'
                }
            }, { status: 401 })
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        })
    } catch (error) {
        console.error('[auth/me] Error:', error)
        return NextResponse.json({ user: null, error: String(error) }, { status: 401 })
    }
}
