import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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

    let userId: string
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        userId = decoded.userId
    } catch {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

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
