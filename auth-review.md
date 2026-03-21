# Auth Flow Review

## src/app/api/auth/register/route.ts
```typescript
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
```

## src/app/api/auth/login/route.ts
```typescript
import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
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

        const response = NextResponse.json({
            success: true,
            user: result.user,
        })

        response.cookies.set('auth_token', result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        })

        return response
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
```

## src/lib/auth/index.ts
```typescript
import { db } from '@/lib/db'
import { authUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SESSION_DURATION_DAYS = 7

export interface AuthUser {
    id: string
    email: string
    name: string | null
    phone: string | null
    emailVerified: boolean | null
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

export function generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function generateJWT(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: `${SESSION_DURATION_DAYS}d` })
}

export function verifyJWT(token: string): { userId: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        return decoded
    } catch {
        return null
    }
}

export async function register(email: string, password: string, name: string, phone?: string) {
    const existing = await db.query.authUsers.findFirst({
        where: eq(authUsers.email, email.toLowerCase())
    })

    if (existing) {
        return { error: 'Email already registered' }
    }

    const passwordHash = await hashPassword(password)
    const emailToken = generateToken()
    const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const [user] = await db.insert(authUsers)
        .values({
            email: email.toLowerCase(),
            name,
            phone,
            passwordHash,
            emailToken,
            emailTokenExpires,
            emailVerified: true,
        })
        .returning()

    const token = generateJWT(user.id)
    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
        path: '/',
    })

    return { user: { id: user.id, email: user.email, name: user.name }, token }
}

export async function confirmEmail(token: string) {
    const user = await db.query.authUsers.findFirst({
        where: eq(authUsers.emailToken, token)
    })

    if (!user) {
        return { error: 'Invalid or expired token' }
    }

    if (user.emailTokenExpires && new Date(user.emailTokenExpires) < new Date()) {
        return { error: 'Token expired' }
    }

    await db.update(authUsers)
        .set({
            emailVerified: true,
            emailToken: null,
            emailTokenExpires: null,
        })
        .where(eq(authUsers.id, user.id))

    return { success: true }
}

export async function login(email: string, password: string) {
    const user = await db.query.authUsers.findFirst({
        where: eq(authUsers.email, email.toLowerCase())
    })

    if (!user) {
        return { error: 'Invalid credentials' }
    }

    const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true'
    if (!user.emailVerified && !skipVerification) {
        return { error: 'Please verify your email first' }
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
        return { error: 'Invalid credentials' }
    }

    const token = generateJWT(user.id)

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified ?? false,
        }
    }
}

export async function logout(token: string) {
    // No session table - JWT is stateless
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) return null

    const decoded = verifyJWT(token)
    if (!decoded) return null

    const user = await db.query.authUsers.findFirst({
        where: eq(authUsers.id, decoded.userId)
    })

    if (!user) return null

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        emailVerified: user.emailVerified ?? false,
    } as AuthUser
}

export async function resendConfirmation(email: string) {
    const user = await db.query.authUsers.findFirst({
        where: eq(authUsers.email, email.toLowerCase())
    })

    if (!user) {
        return { error: 'User not found' }
    }

    if (user.emailVerified) {
        return { error: 'Email already verified' }
    }

    const emailToken = generateToken()
    const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.update(authUsers)
        .set({
            emailToken,
            emailTokenExpires,
        })
        .where(eq(authUsers.id, user.id))

    return { success: true }
}
```

## src/lib/auth/helpers.ts
```typescript
import { cookies } from 'next/headers'
import { verifyJWT } from './index'
import { db } from '@/lib/db'
import { authUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getAuthenticatedUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) return null

    const decoded = verifyJWT(token)
    if (!decoded) return null

    return decoded.userId
}

export async function getAuthenticatedUser() {
    const userId = await getAuthenticatedUserId()
    if (!userId) return null

    const user = await db.query.authUsers.findFirst({
        where: eq(authUsers.id, userId)
    })

    if (!user) return null

    return {
        id: user.id,
        email: user.email,
        name: user.name,
    }
}
```
