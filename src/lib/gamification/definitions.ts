export type AchievementId =
    | 'first_lesson'
    | 'streak_7'
    | 'vocabulary_100'
    | 'first_conversation'
    | 'all_lessons_level'
    | 'first_week'

export interface Achievement {
    id: AchievementId
    name: string
    description: string
    icon: string
    xpReward: number
}

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_lesson', name: 'Primeira Lição', description: 'Complete first lesson', icon: '🌟', xpReward: 50 },
    { id: 'streak_7', name: '7 Dias de Streak', description: '7-day streak', icon: '🔥', xpReward: 100 },
    { id: 'vocabulary_100', name: '100 Palavras', description: '100 vocabulary words', icon: '📚', xpReward: 75 },
    { id: 'first_conversation', name: 'Primeira Conversa', description: 'First voice conversation', icon: '🗣️', xpReward: 50 },
    { id: 'all_lessons_level', name: 'Todas as Lições', description: 'Complete all lessons of a level', icon: '🏆', xpReward: 150 },
    { id: 'first_week', name: 'Primeira Semana', description: '7 days on platform', icon: '⭐', xpReward: 100 },
]

export type MissionType = 'lesson' | 'conversation' | 'vocabulary' | 'xp' | 'streak'

export interface MissionDefinition {
    id: number
    type: MissionType
    title: string
    description: string
    target: number
    xpReward: number
}

export const DEFAULT_MISSIONS: Omit<MissionDefinition, 'id'>[] = [
    { type: 'lesson', title: 'Complete a Lesson', description: 'Finish one lesson from the learning path', target: 1, xpReward: 20 },
    { type: 'conversation', title: 'Practice Speaking', description: 'Practice for 5 minutes with Miss Ana', target: 5, xpReward: 30 },
    { type: 'vocabulary', title: 'Review Vocabulary', description: 'Review 10 words from your vocabulary', target: 10, xpReward: 15 },
]

export interface UserMission {
    type: MissionType
    title: string
    description: string
    target: number
    current: number
    xpReward: number
    completed: boolean
}
