export type ScenarioId = 'tutor' | 'restaurant' | 'interview' | 'hotel' | 'airport' | 'shopping'

export interface Scenario {
    id: ScenarioId
    name: string
    description: string
    icon: string
    color: string
    promptSuffix: string
}

export const SCENARIOS: Scenario[] = [
    {
        id: 'tutor',
        name: 'Free Conversation',
        description: 'Practice any topic with Miss Ana',
        icon: '💬',
        color: 'primary',
        promptSuffix: 'Have a free-flowing conversation on any topic the student brings up. Adapt naturally.',
    },
    {
        id: 'restaurant',
        name: 'Restaurant',
        description: 'Order food, make reservations, interact with staff',
        icon: '🍽️',
        color: 'accent',
        promptSuffix: 'You are a waiter/waitress at a restaurant. The student is a customer. Roleplay ordering food, asking about the menu, making special requests, and paying the bill.',
    },
    {
        id: 'interview',
        name: 'Job Interview',
        description: 'Practice interview questions and answers',
        icon: '💼',
        color: 'yellow-400',
        promptSuffix: 'You are an interviewer at a company. Conduct a professional job interview. Ask about experience, skills, strengths, weaknesses, and salary expectations. Be professional but friendly.',
    },
    {
        id: 'hotel',
        name: 'Hotel',
        description: 'Check-in, room service, complaints, checkout',
        icon: '🏨',
        color: 'blue-400',
        promptSuffix: 'You are a hotel receptionist or concierge. The student is a guest. Roleplay checking in, requesting room service, reporting issues, asking for recommendations, and checking out.',
    },
    {
        id: 'airport',
        name: 'Airport',
        description: 'Check-in, security, boarding, lost luggage',
        icon: '✈️',
        color: 'sky-400',
        promptSuffix: 'You are airline staff at an airport. Help the student with check-in, gate changes, boarding procedures, or lost baggage claims.',
    },
    {
        id: 'shopping',
        name: 'Shopping',
        description: 'Clothing store, bargaining, returns, sizes',
        icon: '🛍️',
        color: 'pink-400',
        promptSuffix: 'You are a shop assistant at a clothing store. Help the student find items, ask about sizes, prices, and colors. Handle returns or exchanges if requested.',
    },
]

export function getScenario(id: ScenarioId): Scenario {
    return SCENARIOS.find(s => s.id === id) || SCENARIOS[0]
}
