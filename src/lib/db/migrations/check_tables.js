import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    console.log('Checking tables...');

    const usersExists = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'`;
    console.log('users table:', usersExists.length > 0 ? 'EXISTS' : 'NOT FOUND');

    const userProgressExists = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_progress'`;
    console.log('user_progress table:', userProgressExists.length > 0 ? 'EXISTS' : 'NOT FOUND');

    await sql.end();
}

main().catch(console.error);