import fs from 'fs';
import postgres from 'postgres';

// Load DATABASE_URL from .env.local if not present in process.env
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const line = envContent.split('\n').find(l => l.startsWith('DATABASE_URL='));
    if (line) {
      databaseUrl = line.split('=')[1].replace(/"/g, '').trim();
    }
  } catch (e) {
    console.error('Failed to read .env.local', e);
  }
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: false }); // adjust if needed

(async () => {
  console.log('Creating UNIQUE constraint on user_progress(user_id)...');
  try {
    await sql`ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_unique UNIQUE (user_id)`;
    console.log('✅ Constraint created successfully');
  } catch (err: any) {
    if (err?.message?.includes('already exists')) {
      console.log('⚠️ Constraint already exists, skipping');
    } else {
      console.error('❌ Failed to create constraint:', err.message);
    }
  } finally {
    await sql.end();
    process.exit(0);
  }
})();
