export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export const LEVEL_ORDER: EnglishLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const LEVEL_XP_THRESHOLD = 500

export const LEVEL_INFO: Record<EnglishLevel, {
    label: string
    color: string
    bgColor: string
    borderColor: string
    description: string
}> = {
    A1: {
        label: 'A1 — Beginner',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        description: 'Can understand and use familiar everyday expressions and very basic phrases.',
    },
    A2: {
        label: 'A2 — Elementary',
        color: 'text-green-300',
        bgColor: 'bg-green-500/15',
        borderColor: 'border-green-500/20',
        description: 'Can communicate in simple and routine tasks requiring direct exchange of information.',
    },
    B1: {
        label: 'B1 — Intermediate',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        description: 'Can deal with most situations likely to arise while traveling.',
    },
    B2: {
        label: 'B2 — Upper Intermediate',
        color: 'text-yellow-300',
        bgColor: 'bg-yellow-500/15',
        borderColor: 'border-yellow-500/20',
        description: 'Can interact with a degree of fluency and spontaneity with native speakers.',
    },
    C1: {
        label: 'C1 — Advanced',
        color: 'text-primary',
        bgColor: 'bg-primary/20',
        borderColor: 'border-primary/30',
        description: 'Can express ideas fluently and spontaneously without much obvious searching for expressions.',
    },
    C2: {
        label: 'C2 — Proficiency',
        color: 'text-accent',
        bgColor: 'bg-accent/20',
        borderColor: 'border-accent/30',
        description: 'Can understand with ease virtually everything heard or read.',
    },
}

export function getLevelFromScore(score: number, total: number): EnglishLevel {
    const pct = (score / total) * 100
    if (pct < 40) return 'A1'
    if (pct < 60) return 'A2'
    if (pct < 75) return 'B1'
    if (pct < 85) return 'B2'
    if (pct < 95) return 'C1'
    return 'C2'
}

export function getXpInLevel(totalXp: number): number {
    const levelIndex = getLevelFromTotalXp(totalXp)
    const xpAtLevelStart = levelIndex * LEVEL_XP_THRESHOLD
    return Math.max(0, totalXp - xpAtLevelStart)
}

export function getLevelFromTotalXp(totalXp: number): number {
    return Math.min(Math.floor(totalXp / LEVEL_XP_THRESHOLD), LEVEL_ORDER.length - 1)
}

export function getCurrentLevel(totalXp: number): EnglishLevel {
    return LEVEL_ORDER[getLevelFromTotalXp(totalXp)]
}

export function getXpToNextLevel(totalXp: number): number {
    const current = getCurrentLevel(totalXp)
    const idx = LEVEL_ORDER.indexOf(current)
    if (idx >= LEVEL_ORDER.length - 1) return 0
    const nextLevelXp = (idx + 1) * LEVEL_XP_THRESHOLD
    return nextLevelXp - totalXp
}

export function getProgressInLevel(totalXp: number): number {
    const levelIndex = getLevelFromTotalXp(totalXp)
    const xpAtLevelStart = levelIndex * LEVEL_XP_THRESHOLD
    const xpInCurrent = totalXp - xpAtLevelStart
    return Math.min(100, (xpInCurrent / LEVEL_XP_THRESHOLD) * 100)
}

export function getNextLevel(current: EnglishLevel): EnglishLevel | null {
    const idx = LEVEL_ORDER.indexOf(current)
    if (idx >= LEVEL_ORDER.length - 1) return null
    return LEVEL_ORDER[idx + 1]
}

export function getLevelCategory(level: EnglishLevel): string {
    if (level.startsWith('A')) return 'beginner'
    if (level.startsWith('B')) return 'intermediate'
    return 'advanced'
}
