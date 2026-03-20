import { db } from '@/lib/db';
import { userProgress } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

async function main() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user');
    return;
  }
  const rows = await db.select().from(userProgress).where(eq(userProgress.userId, user.id));
  console.log('Progress rows for user', user.id, rows);
}

main().catch(e => console.error(e));
