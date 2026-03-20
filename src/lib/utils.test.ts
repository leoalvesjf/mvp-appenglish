import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils.ts - cn()', () => {
    it('should merge class names', () => {
        expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle empty inputs', () => {
        expect(cn()).toBe('')
        expect(cn('')).toBe('')
    })

    it('should handle clsx-style inputs', () => {
        expect(cn('text-red-500', false, null, undefined, 'bg-blue-500')).toContain('text-red-500')
        expect(cn('text-red-500', false, null, undefined, 'bg-blue-500')).toContain('bg-blue-500')
    })

    it('should merge tailwind classes with twMerge', () => {
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
        expect(cn('bg-red-500', 'bg-red-300')).toBe('bg-red-300')
    })

    it('should handle conditional classes', () => {
        const isActive = true
        const isDisabled = false
        expect(cn('base-class', isActive && 'active-class', isDisabled && 'disabled-class'))
            .toContain('base-class')
        expect(cn('base-class', isActive && 'active-class', isDisabled && 'disabled-class'))
            .toContain('active-class')
    })
})
