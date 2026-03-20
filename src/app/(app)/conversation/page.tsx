import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userProgress } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentLevel } from '@/lib/gamification/levels'
import ConversationClient from './conversation-client'
import { getAuthenticatedUser } from '@/lib/auth/helpers'

export default async function ConversationPage() {
    const user = await getAuthenticatedUser()

    if (!user) redirect('/login')

    const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, user.id)
    })
    const totalXp = progress?.totalXp || 0
    const englishLevel = getCurrentLevel(totalXp)

    return <ConversationClient englishLevel={englishLevel} />
}
