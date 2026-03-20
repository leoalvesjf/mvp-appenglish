import { getAuthenticatedUser } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { level, score, total } = await req.json()

        if (!level) {
            return new NextResponse('Missing level', { status: 400 })
        }

        await db.update(users)
            .set({ englishLevel: level })
            .where(eq(users.id, user.id))

        return NextResponse.json({ 
            success: true, 
            level, 
            score, 
            total 
        })
    } catch (error) {
        console.error('Error saving placement test:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}