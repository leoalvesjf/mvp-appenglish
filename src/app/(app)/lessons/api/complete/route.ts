import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { userProgress } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { lessonId, xpReward } = await req.json()

        if (!lessonId) {
            return new NextResponse('Missing lessonId', { status: 400 })
        }

        // Upsert XP and basic progress
        await db.insert(userProgress)
            .values({
                userId: user.id,
                totalXp: xpReward,
                todayXp: xpReward,
                totalConversations: 0,
                totalMinutes: 0,
                currentStreak: 0,
                lastSessionAt: new Date(),
            })
            .onConflictDoUpdate({
                target: userProgress.userId,
                set: {
                    totalXp: sql`${userProgress.totalXp} + ${xpReward}`,
                    todayXp: sql`${userProgress.todayXp} + ${xpReward}`,
                    lastSessionAt: new Date(),
                    updatedAt: new Date(),
                }
            })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error completing lesson:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
