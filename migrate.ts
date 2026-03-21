import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

async function migrate() {
    console.log('Running migration...')
    
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS auth_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT NOT NULL UNIQUE,
                name TEXT,
                phone TEXT,
                password_hash TEXT NOT NULL,
                email_verified BOOLEAN DEFAULT FALSE,
                email_token TEXT,
                email_token_expires TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `)
        console.log('✓ auth_users table created')

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
                token TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `)
        console.log('✓ sessions table created')

        console.log('\n✅ Migration complete!')
    } catch (error) {
        console.error('Migration error:', error)
    }
    
    process.exit(0)
}

migrate()
