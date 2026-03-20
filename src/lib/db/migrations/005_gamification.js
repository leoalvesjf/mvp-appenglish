import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    console.log('Adding gamification columns...');

    // Add achievements and daily tracking to user_progress
    await sql`
        ALTER TABLE public.user_progress 
        ADD COLUMN IF NOT EXISTS achievements text[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS daily_goal_minutes integer DEFAULT 10,
        ADD COLUMN IF NOT EXISTS today_minutes integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_activity_date date,
        ADD COLUMN IF NOT EXISTS daily_missions text[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS missions_completed_at timestamp with time zone
    `;
    console.log('Columns added successfully');

    // Create daily missions config
    await sql`
        CREATE TABLE IF NOT EXISTS public.daily_missions (
            id serial PRIMARY KEY,
            title text NOT NULL,
            description text NOT NULL,
            type text NOT NULL,
            target integer DEFAULT 1,
            xp_reward integer DEFAULT 10,
            created_at timestamp with time zone DEFAULT NOW()
        )
    `;
    console.log('Daily missions table created');

    // Insert default missions
    const existingMissions = await sql`SELECT COUNT(*) as count FROM public.daily_missions`;
    if (existingMissions[0].count === 0) {
        await sql`
            INSERT INTO public.daily_missions (title, description, type, target, xp_reward) VALUES
            ('Complete a Lesson', 'Finish one lesson from the learning path', 'lesson', 1, 20),
            ('Practice Speaking', 'Practice for 5 minutes with Miss Ana', 'conversation', 5, 30),
            ('Review Vocabulary', 'Review 10 words from your vocabulary', 'vocabulary', 10, 15),
            ('Earn XP', 'Earn 50 XP today', 'xp', 50, 25),
            ('Keep the Streak', 'Use the app for 3 days in a row', 'streak', 3, 50)
        `;
        console.log('Default missions inserted');
    }

    await sql.end();
    console.log('Done!');
}

main().catch(console.error);