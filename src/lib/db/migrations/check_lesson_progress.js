import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    console.log('Checking lesson progress...');
    const progress = await sql`
        SELECT ulp.*, l.title as lesson_title, u.email
        FROM public.user_lesson_progress ulp
        JOIN public.lessons l ON ulp.lesson_id = l.id
        JOIN public.users u ON ulp.user_id = u.id
    `;
    console.log('User lesson progress:', progress.length);
    progress.forEach(p => {
        console.log(`- User: ${p.email}, Lesson: ${p.lesson_title}, Status: ${p.status}, Score: ${p.score}`);
    });

    console.log('\nChecking lessons order...');
    const lessons = await sql`SELECT id, title, "order" FROM public.lessons ORDER BY "order"`;
    console.log('Lessons:', lessons.map(l => ({ id: l.id, title: l.title, order: l.order })));

    await sql.end();
}

main().catch(console.error);