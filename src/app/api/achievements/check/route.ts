import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/helpers'
import { checkAndAwardAchievements } from '@/lib/gamification/achievements'

export async function POST() {
    try {
        const user = await getAuthenticatedUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const newAchievements = await checkAndAwardAchievements(user.id)

        return NextResponse.json({
            newAchievements,
            count: newAchievements.length,
        })
    } catch (error) {
        console.error('Error checking achievements:', error)
        return NextResponse.json({ error: 'Failed to check achievements' }, { status: 500 })
    }
}
