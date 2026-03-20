'use client'

import { motion } from 'framer-motion'
import { SCENARIOS, ScenarioId } from '@/lib/conversation/scenarios'
import { cn } from '@/lib/utils'

interface ScenarioSelectorProps {
    selected: ScenarioId
    onSelect: (id: ScenarioId) => void
}

const colorMap: Record<string, string> = {
    primary: 'border-primary/30 bg-primary/10 text-primary',
    accent: 'border-accent/30 bg-accent/10 text-accent',
    'yellow-400': 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400',
    'blue-400': 'border-blue-400/30 bg-blue-400/10 text-blue-400',
    'sky-400': 'border-sky-400/30 bg-sky-400/10 text-sky-400',
    'pink-400': 'border-pink-400/30 bg-pink-400/10 text-pink-400',
}

const activeColorMap: Record<string, string> = {
    primary: 'border-primary bg-primary/20 text-white',
    accent: 'border-accent bg-accent/20 text-white',
    'yellow-400': 'border-yellow-400 bg-yellow-400/20 text-white',
    'blue-400': 'border-blue-400 bg-blue-400/20 text-white',
    'sky-400': 'border-sky-400 bg-sky-400/20 text-white',
    'pink-400': 'border-pink-400 bg-pink-400/20 text-white',
}

export function ScenarioSelector({ selected, onSelect }: ScenarioSelectorProps) {
    return (
        <div className="space-y-3">
            <p className="text-sm text-white/50 text-center mb-4">Choose a conversation scenario</p>
            <div className="grid grid-cols-2 gap-3">
                {SCENARIOS.map((scenario, i) => {
                    const isSelected = selected === scenario.id
                    const colors = isSelected
                        ? activeColorMap[scenario.color]
                        : colorMap[scenario.color]

                    return (
                        <motion.button
                            key={scenario.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => onSelect(scenario.id)}
                            className={cn(
                                'p-4 rounded-2xl border transition-all text-left',
                                colors,
                                isSelected && 'ring-2 ring-offset-2 ring-offset-background'
                            )}
                            style={isSelected ? ({ '--ring-color': 'currentColor' } as React.CSSProperties) : {}}
                        >
                            <span className="text-2xl block mb-2">{scenario.icon}</span>
                            <span className="text-sm font-semibold block">{scenario.name}</span>
                            <span className="text-xs opacity-60 block mt-1">{scenario.description}</span>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
