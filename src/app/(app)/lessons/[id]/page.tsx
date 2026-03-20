import { db } from '@/lib/db'
import { lessons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import LessonDetailClient from './lesson-detail-client'

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, parseInt(id))
    })

    if (!lesson) notFound()

    return <LessonDetailClient lesson={lesson} />
}