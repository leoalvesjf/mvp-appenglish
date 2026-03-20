import { redirect } from 'next/navigation'
import ProfileClient from './profile-client'
import { getAuthenticatedUser } from '@/lib/auth/helpers'

export default async function ProfilePage() {
    const user = await getAuthenticatedUser()

    if (!user) redirect('/login')

    return <ProfileClient />
}