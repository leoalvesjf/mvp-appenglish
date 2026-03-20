import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/helpers'
import { getDailyMissions, resetDailyMissionsIfNeeded, updateMissionProgress } from '@/lib/gamification/missions'
import { MissionType } from '@/lib/gamification/definitions'

export async function GET() {
    try {
        const user = await getAuthenticatedUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await resetDailyMissionsIfNeeded(user.id)
        const missions = await getDailyMissions(user.id)

        return NextResponse.json({ missions })
    } catch (error) {
        console.error('Error fetching daily missions:', error)
        return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { type, amount }: { type: MissionType; amount?: number } = await req.json()

        if (!type) {
            return NextResponse.json({ error: 'Missing mission type' }, { status: 400 })
        }

        await resetDailyMissionsIfNeeded(user.id)
        const result = await updateMissionProgress(user.id, type, amount || 1)

        const missions = await getDailyMissions(user.id)

        return NextResponse.json({
            ...result,
            missions,
        })
    } catch (error) {
        console.error('Error updating mission progress:', error)
        return NextResponse.json({ error: 'Failed to update mission' }, { status: 500 })
    }
}
