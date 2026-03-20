import { db } from './db'
import { sql } from 'drizzle-orm'

async function run() {
    console.log('Adding unique constraint to user_progress(user_id)...')
    try {
        await db.execute(sql`ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_unique UNIQUE (user_id)`)
        console.log('Index created successfully!')
    } catch (e: unknown) {
        const error = e as { message?: string }
        if (error.message?.includes('already exists')) {
            console.log('Constraint already exists, skipping.')
        } else {
            console.error('Failed to create index:', e)
        }
    }
    process.exit(0)
}

run()
