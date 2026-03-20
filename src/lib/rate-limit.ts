const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

export function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const record = rateLimitStore.get(ip)

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + WINDOW_MS })
        return true
    }

    if (record.count >= MAX_ATTEMPTS) {
        return false
    }

    record.count++
    return true
}

export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    return request.headers.get('cf-connecting-ip') || 
           request.headers.get('x-real-ip') || 
           'unknown'
}

setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of rateLimitStore) {
        if (now > record.resetTime) {
            rateLimitStore.delete(ip)
        }
    }
}, 60 * 60 * 1000)