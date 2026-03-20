import { getAuthenticatedUser } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { userProgress, userLessonProgress } from '@/lib/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { resetDailyMissionsIfNeeded, updateMissionProgress } from '@/lib/gamification/missions'
import { checkAndAwardAchievements } from '@/lib/gamification/achievements'

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { lessonId, xpReward, score } = await req.json()

        if (!lessonId) {
            return new NextResponse('Missing lessonId', { status: 400 })
        }

        const existingLessonProgress = await db.query.userLessonProgress.findFirst({
            where: and(
                eq(userLessonProgress.userId, user.id),
                eq(userLessonProgress.lessonId, lessonId)
            )
        })

        if (existingLessonProgress?.status === 'completed') {
            return NextResponse.json({
                success: true,
                newAchievements: [],
                xpEarned: 0,
                message: 'Lesson already completed',
            })
        }

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

        const lessonMinutes = 5

        await db.insert(userProgress)
            .values({
                userId: user.id,
                totalXp: xpReward,
                todayXp: xpReward,
                totalConversations: 0,
                totalMinutes: lessonMinutes,
                currentStreak: 1,
                todayMinutes: lessonMinutes,
                lastActivityDate: new Date(),
                lastSessionAt: new Date(),
            })
            .onConflictDoUpdate({
                target: userProgress.userId,
                set: {
                    totalXp: sql`${userProgress.totalXp} + ${xpReward}`,
                    todayXp: sql`${userProgress.todayXp} + ${xpReward}`,
                    totalMinutes: sql`${userProgress.totalMinutes} + ${lessonMinutes}`,
                    todayMinutes: sql`${userProgress.todayMinutes} + ${lessonMinutes}`,
                    lastActivityDate: new Date(),
                    lastSessionAt: new Date(),
                    updatedAt: new Date(),
                }
            })

        await resetDailyMissionsIfNeeded(user.id)
        await updateMissionProgress(user.id, 'lesson', 1)

        const newAchievements = await checkAndAwardAchievements(user.id)

        return NextResponse.json({
            success: true,
            newAchievements,
            xpEarned: xpReward,
        })
    } catch (error) {
        console.error('Error completing lesson:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
