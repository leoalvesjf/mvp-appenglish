import { db } from '@/lib/db'
import { authUsers, sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { sendConfirmationEmail } from './email'

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
        })
        .returning()

    await sendConfirmationEmail(email, emailToken)

    return { user: { id: user.id, email: user.email, name: user.name } }
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
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)

    await db.insert(sessions)
        .values({
            userId: user.id,
            token,
            expiresAt,
        })

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
    await db.delete(sessions).where(eq(sessions.token, token))
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) return null

    const decoded = verifyJWT(token)
    if (!decoded) return null

    const session = await db.query.sessions.findFirst({
        where: eq(sessions.token, token)
    })

    if (!session || new Date(session.expiresAt) < new Date()) {
        return null
    }

    const user = await db.query.authUsers.findFirst({
        where: eq(authUsers.id, session.userId)
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

    await sendConfirmationEmail(email, emailToken)

    return { success: true }
}
