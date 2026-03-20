import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    console.log('Creating user_lesson_progress table...');

    await sql`
        CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES public.users(id),
            lesson_id integer NOT NULL REFERENCES public.lessons(id),
            status text DEFAULT 'in_progress',
            score integer DEFAULT 0,
            completed_at timestamp with time zone,
            created_at timestamp with time zone DEFAULT NOW(),
            UNIQUE(user_id, lesson_id)
        )
    `;
    console.log('Table created successfully');

    await sql.end();
}

main().catch(console.error);