import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { userProgress, userLessonProgress } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { lessonId, xpReward, score, total } = await req.json()

        if (!lessonId) {
            return new NextResponse('Missing lessonId', { status: 400 })
        }

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

        await db.insert(userLessonProgress)
            .values({
                userId: user.id,
                lessonId: lessonId,
                status: 'completed',
                score: score || 0,
                completedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [userLessonProgress.userId, userLessonProgress.lessonId],
                set: {
                    status: 'completed',
                    score: score || 0,
                    completedAt: new Date(),
                }
            })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error completing lesson:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
