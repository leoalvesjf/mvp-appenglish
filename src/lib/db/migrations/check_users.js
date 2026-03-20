import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    console.log('Checking users in auth...');
    const authUsers = await sql`SELECT id, email FROM auth.users LIMIT 5`;
    console.log('Auth users:', authUsers.length);

    console.log('\nChecking users in public table...');
    const publicUsers = await sql`SELECT id, email, name FROM public.users LIMIT 5`;
    console.log('Public users:', publicUsers.length);

    if (authUsers.length > 0) {
        console.log('\nSample auth user:', authUsers[0]);
    }
    if (publicUsers.length > 0) {
        console.log('Sample public user:', publicUsers[0]);
    }

    await sql.end();
}

main().catch(console.error);