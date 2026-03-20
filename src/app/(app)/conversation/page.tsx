import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userProgress } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentLevel } from '@/lib/gamification/levels'
import ConversationClient from './conversation-client'

export default async function ConversationPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, user.id)
    })
    const totalXp = progress?.totalXp || 0
    const englishLevel = getCurrentLevel(totalXp)

    return <ConversationClient englishLevel={englishLevel} />
}
