# Forgot Password Review

## Arquivos Analisados

### 1. src/app/(auth)/login/page.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))
        if (token) {
            router.push('/dashboard')
        }
    }, [router])

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }

        setLoading(true)
        setError('')

        try {
            console.log('[Login] Attempting login for:', email)
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()
            console.log('[Login] Response:', res.status, data)

            if (!res.ok) {
                setError(data.error || 'Login failed')
                setLoading(false)
                return
            }

            console.log('[Login] Success, redirecting to dashboard')
            window.location.href = '/dashboard'
        } catch {
            setError('An error occurred. Please try again.')
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md z-10 border border-white/10 bg-black/40 backdrop-blur-xl rounded-3xl p-8">
                <div className="text-center space-y-4 mb-8">
                    <div className="flex justify-center">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <Brain className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-white/50 text-sm">
                            Sign in to continue your path to fluency
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </button>
                </div>

                <div className="flex justify-center mt-6">
                    <Link href="/register" className="text-sm text-white/40 hover:text-primary transition-colors">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    )
}
```

---

### 2. src/lib/auth/index.ts

```typescript
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

---

### 3. src/app/api/auth/forgot-password/route.ts

**ARQUIVO NAO EXISTE** - Precisa ser criado.

---

## Análise: O que falta para "Forgot Password"

### Para implementar completamente:

1. **Nova API Route** (`src/app/api/auth/forgot-password/route.ts`)
   - Receber email
   - Gerar token de reset (pode reaproveitar `generateToken()`)
   - Salvar `resetToken` e `resetTokenExpires` no banco
   - Enviar email com link de reset

2. **Nova API Route** (`src/app/api/auth/reset-password/route.ts`)
   - Receber token + nova senha
   - Validar token
   - Atualizar passwordHash
   - Limpar resetToken

3. **Nova Página** (`src/app/(auth)/forgot-password/page.tsx`)
   - Formulário para digitar email
   - Mensagem de "email enviado"

4. **Nova Página** (`src/app/(auth)/reset-password/page.tsx`)
   - Formulário para nova senha (com token na URL)
   - Confirmação de sucesso

5. **Link na página de Login**
   - Adicionar link "Forgot password?" abaixo do formulário

### Pontos a considerar no MVP:
- Sem envio de email real (MVP) - pode apenas retornar sucesso e mostrar o token no console/UI
- Reaproveitar estrutura existente de tokens (`generateToken`, `emailToken`, `emailTokenExpires`)
- O campo `emailToken` já existe na tabela `auth_users` — pode ser usado também para reset de senha
