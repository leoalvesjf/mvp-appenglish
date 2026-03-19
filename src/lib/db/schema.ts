import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: uuid('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name'),
    englishLevel: text('english_level').default('beginner'),
    createdAt: timestamp('created_at').defaultNow(),
})

export const conversations = pgTable('conversations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    startedAt: timestamp('started_at').defaultNow(),
    endedAt: timestamp('ended_at'),
    messageCount: integer('message_count').default(0),
})

export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').references(() => conversations.id),
    role: text('role').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const userProgress = pgTable('user_progress', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    totalConversations: integer('total_conversations').default(0),
    totalMinutes: integer('total_minutes').default(0),
    currentStreak: integer('current_streak').default(0),
    totalXp: integer('total_xp').default(0),
    todayXp: integer('today_xp').default(0),
    lastSessionAt: timestamp('last_session_at'),
    updatedAt: timestamp('updated_at').defaultNow(),
})