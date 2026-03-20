import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    // Find user
    const users = await sql`SELECT id FROM public.users WHERE email = 'leoalvesjf@gmail.com'`;
    if (users.length === 0) {
        console.log('User not found');
        return;
    }
    const userId = users[0].id;
    console.log('User ID:', userId);

    // Create lesson progress for lesson 1
    await sql`
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (${userId}, 1, 'completed', 3, NOW())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 3, completed_at = NOW()
    `;
    console.log('Created lesson progress for lesson 1');

    await sql.end();
}

main().catch(console.error);