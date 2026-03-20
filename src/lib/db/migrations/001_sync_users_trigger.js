import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    console.log('Applying trigger migration...');

    await sql`
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `;
    console.log('Old trigger dropped (if existed)');

    await sql`
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;
    console.log('Trigger created successfully');

    await sql.end();
    console.log('Done!');
}

main().catch(console.error);