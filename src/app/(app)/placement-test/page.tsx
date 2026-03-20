import { db } from '@/lib/db'
import { placementQuestions } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import PlacementTestClient from './placement-test-client'

export default async function PlacementTestPage() {
    const questions = await db.select().from(placementQuestions)
    
    const shuffled = await db.select()
        .from(placementQuestions)
        .orderBy(sql`RANDOM()`)
        .limit(10)
    
    return <PlacementTestClient questions={shuffled.map(q => ({ ...q, options: q.options as unknown[] }))} />
}