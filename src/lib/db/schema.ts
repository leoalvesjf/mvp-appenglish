import { pgTable, uuid, text, timestamp, integer, serial, boolean, json } from 'drizzle-orm/pg-core'

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
    scenario: text('scenario').default('tutor'),
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
    userId: uuid('user_id').references(() => users.id).unique(),
    totalConversations: integer('total_conversations').default(0),
    totalMinutes: integer('total_minutes').default(0),
    currentStreak: integer('current_streak').default(0),
    totalXp: integer('total_xp').default(0),
    todayXp: integer('today_xp').default(0),
    lastSessionAt: timestamp('last_session_at'),
    updatedAt: timestamp('updated_at').defaultNow(),
    achievements: json('achievements').default([]),
    dailyGoalMinutes: integer('daily_goal_minutes').default(10),
    todayMinutes: integer('today_minutes').default(0),
    lastActivityDate: timestamp('last_activity_date'),
    dailyMissions: json('daily_missions').default([]),
    missionsCompletedAt: timestamp('missions_completed_at'),
})

export const dailyMissions = pgTable('daily_missions', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    type: text('type').notNull(),
    target: integer('target').default(1),
    xpReward: integer('xp_reward').default(10),
})

export const userLessonProgress = pgTable('user_lesson_progress', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
    status: text('status').default('in_progress'),
    score: integer('score').default(0),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
})

export const userVocabulary = pgTable('user_vocabulary', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    word: text('word').notNull(),
    correction: text('correction').notNull(),
    explanation: text('explanation'),
    source: text('source').default('lesson'),
    lessonId: integer('lesson_id'),
    createdAt: timestamp('created_at').defaultNow(),
})

export const placementQuestions = pgTable('placement_questions', {
    id: serial('id').primaryKey(),
    question: text('question').notNull(),
    options: json('options').notNull(),
    correctAnswer: text('correct_answer').notNull(),
    explanation: text('explanation'),
    level: text('level').notNull(),
    category: text('category').default('general'),
})

export const lessons = pgTable('lessons', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    level: text('level').notNull(),
    category: text('category').notNull(),
    xpReward: integer('xp_reward').default(50),
    durationMinutes: integer('duration_minutes').default(10),
    isLocked: boolean('is_locked').default(false),
    order: integer('order').default(0),
    icon: text('icon').default('📚'),
    exercises: json('exercises').default([]),
    vocabulary: json('vocabulary').default([]),
})