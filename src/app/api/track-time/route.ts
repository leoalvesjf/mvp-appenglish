import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { userProgress } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { resetDailyMissionsIfNeeded, updateMissionProgress } from '@/lib/gamification/missions'
import { checkAndAwardAchievements } from '@/lib/gamification/achievements'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { minutes } = await req.json()
        const minutesToAdd = minutes || 1

        const today = new Date().toISOString().split('T')[0]
        
        const progress = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, user.id)
        })

        const lastDate = progress?.lastActivityDate 
            ? new Date(progress.lastActivityDate).toISOString().split('T')[0] 
            : null

        let newStreak = progress?.currentStreak || 0
        
        if (lastDate === today) {
            // Same day, just add minutes
            await db.update(userProgress)
                .set({
                    todayMinutes: sql`${userProgress.todayMinutes} + ${minutesToAdd}`,
                    totalMinutes: sql`${userProgress.totalMinutes} + ${minutesToAdd}`,
                    lastSessionAt: new Date(),
                })
                .where(eq(userProgress.userId, user.id))
        } else if (lastDate) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]
            
            if (lastDate === yesterdayStr) {
                // Consecutive day - increment streak
                newStreak += 1
            } else {
                // Streak broken - reset
                newStreak = 1
            }
            
            await db.update(userProgress)
                .set({
                    currentStreak: newStreak,
                    todayMinutes: minutesToAdd,
                    totalMinutes: sql`${userProgress.totalMinutes} + ${minutesToAdd}`,
                    lastActivityDate: new Date(),
                    lastSessionAt: new Date(),
                })
                .where(eq(userProgress.userId, user.id))
        } else {
            // First time user
            await db.insert(userProgress)
                .values({
                    userId: user.id,
                    todayMinutes: minutesToAdd,
                    totalMinutes: minutesToAdd,
                    currentStreak: 1,
                    lastActivityDate: new Date(),
                    lastSessionAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: userProgress.userId,
                    set: {
                        todayMinutes: sql`${userProgress.todayMinutes} + ${minutesToAdd}`,
                        totalMinutes: sql`${userProgress.totalMinutes} + ${minutesToAdd}`,
                        currentStreak: 1,
                        lastActivityDate: new Date(),
                        lastSessionAt: new Date(),
                    }
                })
        }

        await resetDailyMissionsIfNeeded(user.id)
        await updateMissionProgress(user.id, 'conversation', minutesToAdd)
        await checkAndAwardAchievements(user.id)

        return NextResponse.json({ 
            success: true, 
            streak: newStreak,
            minutes: minutesToAdd
        })
    } catch (error) {
        console.error('Error tracking time:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}