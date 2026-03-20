import { defineConfig } from 'drizzle-kit'
import fs from 'fs'

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    try {
        const envLocal = fs.readFileSync('.env.local', 'utf8')
        databaseUrl = envLocal.split('\n').find(line => line.includes('DATABASE_URL='))?.split('=')[1]?.replace(/["']/g, '').trim()
    } catch (e) {
        console.error('Could not load .env.local', e)
    }
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl!,
  },
})
