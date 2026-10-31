import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import prisma from './prisma'

export { STATUS_TRANSITIONS } from './admin-status'

// Returns the logged-in user only if they are an admin. The role is read from
// the database (not the session token) so removing admin rights takes effect immediately.
export async function getAdminUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true }
  })
  return user?.role === 'ADMIN' ? user : null
}
