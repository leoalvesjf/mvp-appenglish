import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userVocabulary } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import VocabularyClient from './vocabulary-client'

export default async function VocabularyPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const vocabulary = await db
        .select()
        .from(userVocabulary)
        .where(eq(userVocabulary.userId, user.id))
        .orderBy(desc(userVocabulary.createdAt))

    return <VocabularyClient vocabulary={vocabulary} />
}