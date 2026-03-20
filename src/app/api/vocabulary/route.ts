import { getAuthenticatedUser } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { userVocabulary } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { resetDailyMissionsIfNeeded, updateMissionProgress } from '@/lib/gamification/missions'
import { checkAndAwardAchievements } from '@/lib/gamification/achievements'

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { word, correction, explanation, source, lessonId } = await req.json()

        if (!word || !correction) {
            return new NextResponse('Missing word or correction', { status: 400 })
        }

        await db.insert(userVocabulary).values({
            userId: user.id,
            word,
            correction,
            explanation: explanation || null,
            source: source || 'lesson',
            lessonId: lessonId || null,
        })

        await resetDailyMissionsIfNeeded(user.id)
        await updateMissionProgress(user.id, 'vocabulary', 1)
        await checkAndAwardAchievements(user.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving vocabulary:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}