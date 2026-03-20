import postgres from 'postgres'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    console.error('DATABASE_URL not found')
    process.exit(1)
}

const sql = postgres(connectionString)

async function main() {
    console.log('Applying trigger migration...')

    await sql`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.users (id, email, name, english_level, created_at)
            VALUES (
                NEW.id,
                NEW.email,
                NEW.raw_user_meta_data->>'name',
                COALESCE(NEW.raw_user_meta_data->>'english_level', 'beginner'),
                NOW()
            );
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    console.log('Function created successfully')

    await sql`
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
    console.log('Trigger created successfully')

    await sql.end()
    console.log('Done!')
}

main().catch(console.error)