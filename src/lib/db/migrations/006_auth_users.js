import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

async function migrate() {
    console.log('Running auth migration...')

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

        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)
        `)
        console.log('✓ indexes created')

        console.log('\n✅ Migration completed!')
    } catch (error) {
        console.error('Migration failed:', error)
        throw error
    }

    process.exit(0)
}

migrate()
