export type ScenarioId = 'tutor' | 'restaurant' | 'interview' | 'hotel' | 'airport' | 'shopping'

export interface Scenario {
    id: ScenarioId
    name: string
    description: string
    icon: string
    color: string
    promptSuffix: string
    maxTurns: number
    objective: string
}

export const SCENARIOS: Scenario[] = [
    {
        id: 'tutor',
        name: 'Free Conversation',
        description: 'Practice any topic with Miss Ana',
        icon: '💬',
        color: 'primary',
        promptSuffix: 'Have a free-flowing conversation on any topic the student brings up. Adapt naturally.',
        maxTurns: 999,
        objective: 'Free conversation practice',
    },
    {
        id: 'restaurant',
        name: 'Restaurant',
        description: 'Order food, make reservations, interact with staff',
        icon: '🍽️',
        color: 'accent',
        promptSuffix: `You are a waiter/waitress at a restaurant. The student is a customer. Guide the student to complete the objective in 3 user turns: order a starter, order a main course, and ask for the bill. On the turn BEFORE the last, start your response with [[WARN]]. After the student completes the objective OR on the last turn, give a warm final verdict (what they did well, grammar tips, pronunciation advice) and end your message with [[COMPLETE]]`,
        maxTurns: 3,
        objective: 'Order a starter, order a main course, and ask for the bill',
    },
    {
        id: 'interview',
        name: 'Job Interview',
        description: 'Practice interview questions and answers',
        icon: '💼',
        color: 'yellow-400',
        promptSuffix: `You are an interviewer at a company. Conduct a professional job interview. Guide the student to complete the objective in 4 user turns: introduce themselves, discuss their experience, describe their strengths, and ask a closing question. On the turn BEFORE the last, start your response with [[WARN]]. After the student completes the objective OR on the last turn, give a warm final verdict (what they did well, grammar tips, pronunciation advice) and end your message with [[COMPLETE]]`,
        maxTurns: 4,
        objective: 'Introduce yourself, discuss experience, describe strengths, and ask a closing question',
    },
    {
        id: 'hotel',
        name: 'Hotel',
        description: 'Check-in, room service, complaints, checkout',
        icon: '🏨',
        color: 'blue-400',
        promptSuffix: `You are a hotel receptionist or concierge. The student is a guest. Guide the student to complete the objective in 3 user turns: check in at the front desk, request room service, and check out. On the turn BEFORE the last, start your response with [[WARN]]. After the student completes the objective OR on the last turn, give a warm final verdict (what they did well, grammar tips, pronunciation advice) and end your message with [[COMPLETE]]`,
        maxTurns: 3,
        objective: 'Check in at the front desk, request room service, and check out',
    },
    {
        id: 'airport',
        name: 'Airport',
        description: 'Check-in, security, boarding, lost luggage',
        icon: '✈️',
        color: 'sky-400',
        promptSuffix: `You are airline staff at an airport. Help the student with check-in, gate changes, boarding procedures, or lost baggage claims. Guide the student to complete the objective in 3 user turns: complete online/mobile check-in, handle baggage drop-off, and ask for directions at the boarding gate. On the turn BEFORE the last, start your response with [[WARN]]. After the student completes the objective OR on the last turn, give a warm final verdict (what they did well, grammar tips, pronunciation advice) and end your message with [[COMPLETE]]`,
        maxTurns: 3,
        objective: 'Complete check-in, handle baggage, and find the boarding gate',
    },
    {
        id: 'shopping',
        name: 'Shopping',
        description: 'Clothing store, bargaining, returns, sizes',
        icon: '🛍️',
        color: 'pink-400',
        promptSuffix: `You are a shop assistant at a clothing store. Help the student find items, ask about sizes, prices, and colors. Handle returns or exchanges if requested. Guide the student to complete the objective in 3 user turns: find a specific item, ask about size/color availability, and ask about payment methods. On the turn BEFORE the last, start your response with [[WARN]]. After the student completes the objective OR on the last turn, give a warm final verdict (what they did well, grammar tips, pronunciation advice) and end your message with [[COMPLETE]]`,
        maxTurns: 3,
        objective: 'Find a specific item, ask about size/color availability, and ask about payment methods',
    },
]

export function getScenario(id: ScenarioId): Scenario {
    return SCENARIOS.find(s => s.id === id) || SCENARIOS[0]
}
