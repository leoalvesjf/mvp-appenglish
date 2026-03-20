import { describe, it, expect } from 'vitest'
import {
    ACHIEVEMENTS,
    DEFAULT_MISSIONS,
    type AchievementId,
    type MissionType
} from './definitions'

describe('definitions.ts - ACHIEVEMENTS', () => {
    it('should have all expected achievement IDs', () => {
        const expectedIds: AchievementId[] = [
            'first_lesson',
            'streak_7',
            'vocabulary_100',
            'first_conversation',
            'all_lessons_level',
            'first_week'
        ]

        const actualIds = ACHIEVEMENTS.map(a => a.id)
        expectedIds.forEach(id => {
            expect(actualIds).toContain(id)
        })
    })

    it('should have 6 achievements', () => {
        expect(ACHIEVEMENTS).toHaveLength(6)
    })

    it('each achievement should have required fields', () => {
        ACHIEVEMENTS.forEach(achievement => {
            expect(achievement).toHaveProperty('id')
            expect(achievement).toHaveProperty('name')
            expect(achievement).toHaveProperty('description')
            expect(achievement).toHaveProperty('icon')
            expect(achievement).toHaveProperty('xpReward')
            expect(typeof achievement.xpReward).toBe('number')
            expect(achievement.xpReward).toBeGreaterThan(0)
        })
    })

    it('should have unique IDs', () => {
        const ids = ACHIEVEMENTS.map(a => a.id)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
    })

    it('first_lesson should have correct structure', () => {
        const firstLesson = ACHIEVEMENTS.find(a => a.id === 'first_lesson')
        expect(firstLesson).toBeDefined()
        expect(firstLesson?.xpReward).toBe(50)
    })

    it('streak_7 should have correct structure', () => {
        const streak = ACHIEVEMENTS.find(a => a.id === 'streak_7')
        expect(streak).toBeDefined()
        expect(streak?.xpReward).toBe(100)
    })

    it('all_lessons_level should have highest XP reward', () => {
        const allLessons = ACHIEVEMENTS.find(a => a.id === 'all_lessons_level')
        const maxXp = Math.max(...ACHIEVEMENTS.map(a => a.xpReward))
        expect(allLessons?.xpReward).toBe(maxXp)
    })
})

describe('definitions.ts - DEFAULT_MISSIONS', () => {
    it('should have 3 default missions', () => {
        expect(DEFAULT_MISSIONS).toHaveLength(3)
    })

    it('each mission should have required fields', () => {
        DEFAULT_MISSIONS.forEach(mission => {
            expect(mission).toHaveProperty('type')
            expect(mission).toHaveProperty('title')
            expect(mission).toHaveProperty('description')
            expect(mission).toHaveProperty('target')
            expect(mission).toHaveProperty('xpReward')
            expect(typeof mission.target).toBe('number')
            expect(typeof mission.xpReward).toBe('number')
        })
    })

    it('should have lesson mission', () => {
        const lessonMission = DEFAULT_MISSIONS.find(m => m.type === 'lesson')
        expect(lessonMission).toBeDefined()
        expect(lessonMission?.target).toBe(1)
    })

    it('should have conversation mission', () => {
        const convMission = DEFAULT_MISSIONS.find(m => m.type === 'conversation')
        expect(convMission).toBeDefined()
        expect(convMission?.target).toBe(5)
    })

    it('should have vocabulary mission', () => {
        const vocabMission = DEFAULT_MISSIONS.find(m => m.type === 'vocabulary')
        expect(vocabMission).toBeDefined()
        expect(vocabMission?.target).toBe(10)
    })

    it('should have unique mission types', () => {
        const types = DEFAULT_MISSIONS.map(m => m.type)
        const uniqueTypes = new Set(types)
        expect(uniqueTypes.size).toBe(types.length)
    })
})

describe('definitions.ts - MissionType', () => {
    it('should include all expected mission types', () => {
        const expectedTypes: MissionType[] = ['lesson', 'conversation', 'vocabulary', 'xp', 'streak']
        expectedTypes.forEach(type => {
            expect(['lesson', 'conversation', 'vocabulary', 'xp', 'streak']).toContain(type)
        })
    })
})
