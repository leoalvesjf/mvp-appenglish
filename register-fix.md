import { db } from '@/lib/db'
import { authUsers, users, userProgress } from '@/lib/db/schema'
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

    // Cria perfil do usuário
    await db.insert(users)
        .values({
            id: user.id,
            email: user.email,
            name: user.name,
        })
        .onConflictDoNothing()

    // Cria progresso inicial
    await db.insert(userProgress)
        .values({
            userId: user.id,
            totalXp: 0,
            todayXp: 0,
            currentStreak: 0,
            totalConversations: 0,
            totalMinutes: 0,
        })
        .onConflictDoNothing()

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
