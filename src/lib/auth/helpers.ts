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