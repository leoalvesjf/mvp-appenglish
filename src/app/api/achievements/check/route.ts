import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndAwardAchievements } from '@/lib/gamification/achievements'

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

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
