import { NextResponse, type NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

const publicPaths = [
    '/',
    '/login',
    '/register',
    '/auth/confirm',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/confirm',
    '/api/auth/resend',
    '/api/auth/logout',
    '/api/auth/me',
]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const isPublic = publicPaths.some(path => pathname.startsWith(path))

    if (!isPublic) {
        const authToken = request.cookies.get('auth_token')?.value

        if (!authToken) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            jwt.verify(authToken, JWT_SECRET)
        } catch {
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('auth_token')
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
