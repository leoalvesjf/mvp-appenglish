import { db } from '@/lib/db'
import { lessons, userLessonProgress } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'
import LessonsClient from './lessons-client'
import { getAuthenticatedUser } from '@/lib/auth/helpers'

export default async function LessonsPage() {
    const user = await getAuthenticatedUser()

    const allLessons = await db.select().from(lessons).orderBy(asc(lessons.order))

    let completedLessonIds: number[] = []
    if (user) {
        const completed = await db
            .select({ lessonId: userLessonProgress.lessonId })
            .from(userLessonProgress)
            .where(eq(userLessonProgress.userId, user.id))
        completedLessonIds = completed.map(c => c.lessonId)
    }

    const data = allLessons.map(lesson => {
        const isCompleted = completedLessonIds.includes(lesson.id)
        
        const lessonOrder = lesson.order ?? 0
        const previousLesson = allLessons.find(l => (l.order ?? 0) === lessonOrder - 1)
        const isLocked = !isCompleted && previousLesson ? !completedLessonIds.includes(previousLesson.id) : false
        
        return {
            ...lesson,
            isCompleted,
            isLocked
        }
    })

    return <LessonsClient lessons={data} />
}