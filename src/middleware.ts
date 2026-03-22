export const runtime = 'edge'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

async function verifyJWTEdge(token: string, secret: string): Promise<{ userId: string } | null> {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null

        const encoder = new TextEncoder()
        const keyData = encoder.encode(secret)
        const key = await crypto.subtle.importKey(
            'raw', keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false, ['verify']
        )

        const signatureBase64 = parts[2].replace(/-/g, '+').replace(/_/g, '/')
        const signatureBuffer = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0))
        const dataBuffer = encoder.encode(`${parts[0]}.${parts[1]}`)

        const valid = await crypto.subtle.verify('HMAC', key, signatureBuffer, dataBuffer)
        if (!valid) return null

        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
        if (payload.exp && payload.exp < Date.now() / 1000) return null

        return { userId: payload.userId }
    } catch {
        return null
    }
}

const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/placement-test',
    '/acesso-negado',
    '/favicon.ico',
]

const PUBLIC_PREFIXES = [
    '/api/auth/',
    '/_next/',
    '/public/',
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    for (const route of PUBLIC_ROUTES) {
        if (pathname === route) return NextResponse.next()
    }

    for (const prefix of PUBLIC_PREFIXES) {
        if (pathname.startsWith(prefix)) return NextResponse.next()
    }

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    const decoded = await verifyJWTEdge(token, JWT_SECRET)
    if (!decoded) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    const userId = decoded.userId

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.next()
    }

    try {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=is_active`,
            {
                headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                },
            }
        )

        if (response.ok) {
            const data = await response.json()
            const isActive = data?.[0]?.is_active

            if (isActive === false) {
                return NextResponse.redirect(new URL('/acesso-negado', request.url))
            }
        }
    } catch {
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
