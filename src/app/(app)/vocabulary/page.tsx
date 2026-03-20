import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userVocabulary } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import VocabularyClient from './vocabulary-client'
import { getAuthenticatedUser } from '@/lib/auth/helpers'

export default async function VocabularyPage() {
    const user = await getAuthenticatedUser()

    if (!user) redirect('/login')

    const vocabulary = await db
        .select()
        .from(userVocabulary)
        .where(eq(userVocabulary.userId, user.id))
        .orderBy(desc(userVocabulary.createdAt))

    return <VocabularyClient vocabulary={vocabulary} />
}