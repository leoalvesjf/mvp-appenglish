import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    console.log('Creating user_vocabulary table...');

    await sql`
        CREATE TABLE IF NOT EXISTS public.user_vocabulary (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES public.users(id),
            word text NOT NULL,
            correction text NOT NULL,
            explanation text,
            source text DEFAULT 'lesson',
            lesson_id integer REFERENCES public.lessons(id),
            created_at timestamp with time zone DEFAULT NOW()
        )
    `;
    console.log('Table created successfully');

    await sql.end();
}

main().catch(console.error);