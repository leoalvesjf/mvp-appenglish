import { db } from '@/lib/db'
import { userProgress, dailyMissions } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { UserMission, MissionType } from './definitions'

export async function getDailyMissions(userId: string): Promise<UserMission[]> {
    const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId)
    })

    const today = new Date().toISOString().split('T')[0]
    const lastReset = progress?.missionsCompletedAt
        ? new Date(progress.missionsCompletedAt).toISOString().split('T')[0]
        : null

    if (lastReset !== today) {
        const missions = await db.select().from(dailyMissions).limit(3)
        return missions.map(m => ({
            type: m.type as MissionType,
            title: m.title,
            description: m.description,
            target: m.target ?? 1,
            current: 0,
            xpReward: m.xpReward ?? 10,
            completed: false,
        }))
    }

    const saved: UserMission[] = (progress?.dailyMissions as unknown as UserMission[]) || []
    if (saved.length === 0) {
        return [
            { type: 'lesson', title: 'Complete a Lesson', description: 'Finish one lesson from the learning path', target: 1, xpReward: 20, current: 0, completed: false },
            { type: 'conversation', title: 'Practice Speaking', description: 'Practice for 5 minutes with Miss Ana', target: 5, xpReward: 30, current: 0, completed: false },
            { type: 'vocabulary', title: 'Review Vocabulary', description: 'Review 10 words from your vocabulary', target: 10, xpReward: 15, current: 0, completed: false },
        ]
    }
    return saved
}

export async function updateMissionProgress(
    userId: string,
    type: MissionType,
    amount: number = 1
): Promise<{ updated: boolean; mission?: UserMission; allCompleted?: boolean } | { updated: false }> {
    const missions = await getDailyMissions(userId)

    const idx = missions.findIndex(m => m.type === type)
    if (idx === -1) return { updated: false }

    missions[idx].current = Math.min(missions[idx].current + amount, missions[idx].target)
    missions[idx].completed = missions[idx].current >= missions[idx].target

    const allCompleted = missions.every(m => m.completed)
    const bonusXp = allCompleted ? 50 : 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setObj: Record<string, any> = {
        dailyMissions: missions,
        missionsCompletedAt: allCompleted ? new Date() : null,
    }
    if (bonusXp > 0) {
        setObj.totalXp = sql`${userProgress.totalXp} + ${bonusXp}`
    }

    await db.update(userProgress).set(setObj).where(eq(userProgress.userId, userId))

    return {
        updated: true,
        mission: missions[idx],
        allCompleted,
    }
}

export async function resetDailyMissionsIfNeeded(userId: string): Promise<void> {
    const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId)
    })

    const today = new Date().toISOString().split('T')[0]
    const lastReset = progress?.missionsCompletedAt
        ? new Date(progress.missionsCompletedAt).toISOString().split('T')[0]
        : null

    if (lastReset !== today && progress) {
        const missions = await db.select().from(dailyMissions).limit(3)
        const fresh = missions.map(m => ({
            type: m.type as MissionType,
            title: m.title,
            description: m.description,
            target: m.target ?? 1,
            current: 0,
            xpReward: m.xpReward ?? 10,
            completed: false,
        }))

        await db.update(userProgress)
            .set({
                dailyMissions: fresh,
                missionsCompletedAt: null,
            })
            .where(eq(userProgress.userId, userId))
    }
}
