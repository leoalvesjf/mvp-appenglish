import { describe, it, expect } from 'vitest'
import {
    getLevelFromScore,
    getXpInLevel,
    getLevelFromTotalXp,
    getCurrentLevel,
    getXpToNextLevel,
    getProgressInLevel,
    getNextLevel,
    getLevelCategory,
    LEVEL_XP_THRESHOLD,
    LEVEL_ORDER,
    type EnglishLevel
} from './levels'

describe('levels.ts - getLevelFromScore', () => {
    it('should return A1 for score below 40%', () => {
        expect(getLevelFromScore(0, 100)).toBe('A1')
        expect(getLevelFromScore(39, 100)).toBe('A1')
    })

    it('should return A2 for score between 40-60%', () => {
        expect(getLevelFromScore(40, 100)).toBe('A2')
        expect(getLevelFromScore(59, 100)).toBe('A2')
    })

    it('should return B1 for score between 60-75%', () => {
        expect(getLevelFromScore(60, 100)).toBe('B1')
        expect(getLevelFromScore(74, 100)).toBe('B1')
    })

    it('should return B2 for score between 75-85%', () => {
        expect(getLevelFromScore(75, 100)).toBe('B2')
        expect(getLevelFromScore(84, 100)).toBe('B2')
    })

    it('should return C1 for score between 85-95%', () => {
        expect(getLevelFromScore(85, 100)).toBe('C1')
        expect(getLevelFromScore(94, 100)).toBe('C1')
    })

    it('should return C2 for score 95% or above', () => {
        expect(getLevelFromScore(95, 100)).toBe('C2')
        expect(getLevelFromScore(100, 100)).toBe('C2')
    })
})

describe('levels.ts - getLevelFromTotalXp', () => {
    it('should return level 0 (A1) for XP below threshold', () => {
        expect(getLevelFromTotalXp(0)).toBe(0)
        expect(getLevelFromTotalXp(499)).toBe(0)
    })

    it('should return level 1 (A2) for XP at threshold', () => {
        expect(getLevelFromTotalXp(500)).toBe(1)
        expect(getLevelFromTotalXp(999)).toBe(1)
    })

    it('should return correct level indices', () => {
        expect(getLevelFromTotalXp(0)).toBe(0)
        expect(getLevelFromTotalXp(500)).toBe(1)
        expect(getLevelFromTotalXp(1000)).toBe(2)
        expect(getLevelFromTotalXp(1500)).toBe(3)
        expect(getLevelFromTotalXp(2000)).toBe(4)
        expect(getLevelFromTotalXp(2500)).toBe(5)
    })

    it('should cap at max level (C2)', () => {
        expect(getLevelFromTotalXp(5000)).toBe(5)
        expect(getLevelFromTotalXp(10000)).toBe(5)
    })
})

describe('levels.ts - getCurrentLevel', () => {
    it('should return correct EnglishLevel for XP values', () => {
        expect(getCurrentLevel(0)).toBe('A1')
        expect(getCurrentLevel(500)).toBe('A2')
        expect(getCurrentLevel(1000)).toBe('B1')
        expect(getCurrentLevel(1500)).toBe('B2')
        expect(getCurrentLevel(2000)).toBe('C1')
        expect(getCurrentLevel(2500)).toBe('C2')
    })
})

describe('levels.ts - getXpInLevel', () => {
    it('should return XP within current level', () => {
        expect(getXpInLevel(100)).toBe(100)
        expect(getXpInLevel(500)).toBe(0)
        expect(getXpInLevel(600)).toBe(100)
        expect(getXpInLevel(1000)).toBe(0)
    })

    it('should handle zero XP correctly', () => {
        expect(getXpInLevel(0)).toBe(0)
    })
})

describe('levels.ts - getXpToNextLevel', () => {
    it('should return correct XP needed to next level', () => {
        expect(getXpToNextLevel(0)).toBe(500)
        expect(getXpToNextLevel(100)).toBe(400)
        expect(getXpToNextLevel(499)).toBe(1)
        expect(getXpToNextLevel(500)).toBe(500)
    })

    it('should return 0 for max level (C2)', () => {
        expect(getXpToNextLevel(2500)).toBe(0)
        expect(getXpToNextLevel(5000)).toBe(0)
    })
})

describe('levels.ts - getProgressInLevel', () => {
    it('should return correct progress percentage', () => {
        expect(getProgressInLevel(0)).toBe(0)
        expect(getProgressInLevel(250)).toBe(50)
        expect(getProgressInLevel(500)).toBe(0)
        expect(getProgressInLevel(750)).toBe(50)
    })

    it('should cap at 100%', () => {
        expect(getProgressInLevel(2500)).toBe(0)
        expect(getProgressInLevel(3000)).toBe(100)
    })
})

describe('levels.ts - getNextLevel', () => {
    it('should return next level in sequence', () => {
        expect(getNextLevel('A1')).toBe('A2')
        expect(getNextLevel('A2')).toBe('B1')
        expect(getNextLevel('B1')).toBe('B2')
        expect(getNextLevel('B2')).toBe('C1')
        expect(getNextLevel('C1')).toBe('C2')
    })

    it('should return null for max level', () => {
        expect(getNextLevel('C2')).toBe(null)
    })
})

describe('levels.ts - getLevelCategory', () => {
    it('should return correct category for A levels', () => {
        expect(getLevelCategory('A1')).toBe('beginner')
        expect(getLevelCategory('A2')).toBe('beginner')
    })

    it('should return correct category for B levels', () => {
        expect(getLevelCategory('B1')).toBe('intermediate')
        expect(getLevelCategory('B2')).toBe('intermediate')
    })

    it('should return correct category for C levels', () => {
        expect(getLevelCategory('C1')).toBe('advanced')
        expect(getLevelCategory('C2')).toBe('advanced')
    })
})

describe('levels.ts - constants', () => {
    it('should have correct LEVEL_ORDER sequence', () => {
        expect(LEVEL_ORDER).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    })

    it('should have correct LEVEL_XP_THRESHOLD', () => {
        expect(LEVEL_XP_THRESHOLD).toBe(500)
    })

    it('should have 6 levels', () => {
        expect(LEVEL_ORDER.length).toBe(6)
    })
})
