import { db } from '@/lib/db'
import { userProgress, userLessonProgress, userVocabulary, conversations, lessons, users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { ACHIEVEMENTS, AchievementId, Achievement } from './definitions'
import { getLevelCategory } from './levels'
import { EnglishLevel } from './levels'

export async function checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = []

    const [progress, userData] = await Promise.all([
        db.query.userProgress.findFirst({ where: eq(userProgress.userId, userId) }),
        db.query.users.findFirst({ where: eq(users.id, userId) }),
    ])
    const unlockedIds = new Set<string>((progress?.achievements as AchievementId[]) || [])
    const userLevel = (userData?.englishLevel || 'A1') as EnglishLevel

    const userLessons = await db.query.userLessonProgress.findMany({
        where: eq(userLessonProgress.userId, userId)
    })
    const completedLessons = userLessons.filter(l => l.status === 'completed')

    const vocabCount = await db.query.userVocabulary.findMany({
        where: eq(userVocabulary.userId, userId)
    })

    const conversationCount = await db.query.conversations.findMany({
        where: eq(conversations.userId, userId)
    })

    const allLessons = await db.select().from(lessons)

    const checks: Array<{ id: AchievementId; condition: boolean }> = [
        { id: 'first_lesson', condition: completedLessons.length >= 1 },
        { id: 'streak_7', condition: (progress?.currentStreak || 0) >= 7 },
        { id: 'vocabulary_100', condition: vocabCount.length >= 100 },
        { id: 'first_conversation', condition: conversationCount.length >= 1 },
        {
            id: 'all_lessons_level',
            condition: checkAllLessonsForLevel(completedLessons, allLessons, userLevel)
        },
        { id: 'first_week', condition: (progress?.currentStreak || 0) >= 7 },
    ]

    for (const check of checks) {
        if (check.condition && !unlockedIds.has(check.id)) {
            unlockedIds.add(check.id)
            const def = ACHIEVEMENTS.find(a => a.id === check.id)
            if (def) {
                newlyUnlocked.push(def)
            }
        }
    }

    if (newlyUnlocked.length > 0) {
        const totalReward = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0)
        await db.update(userProgress)
            .set({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                achievements: Array.from(unlockedIds) as any,
                totalXp: sql`${userProgress.totalXp} + ${totalReward}`,
            })
            .where(eq(userProgress.userId, userId))
    }

    return newlyUnlocked
}

function checkAllLessonsForLevel(
    completed: { lessonId: number | null }[],
    allLessons: { id: number; level: string }[],
    userLevel: EnglishLevel
): boolean {
    const category = getLevelCategory(userLevel)
    const levelLessonIds = new Set(allLessons.filter(l => l.level === category).map(l => l.id))
    if (levelLessonIds.size === 0) return false
    const completedIds = new Set(completed.filter(l => l.lessonId !== null).map(l => l.lessonId!))
    return [...levelLessonIds].every(id => completedIds.has(id))
}
