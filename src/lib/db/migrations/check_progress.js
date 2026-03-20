import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    console.log('Checking user_progress...');
    const progress = await sql`SELECT * FROM public.user_progress`;
    console.log('User progress records:', progress.length);
    if (progress.length > 0) {
        console.log('Sample:', progress[0]);
    }

    console.log('\nChecking lessons table...');
    const lessons = await sql`SELECT * FROM public.lessons LIMIT 3`;
    console.log('Lessons count:', lessons.length);

    await sql.end();
}

main().catch(console.error);