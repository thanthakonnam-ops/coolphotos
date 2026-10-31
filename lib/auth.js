import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('กรุณากรอกอีเมลและรหัสผ่าน')
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() }
        })
        if (!user) {
          throw new Error('ไม่พบบัญชีผู้ใช้นี้')
        }
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('รหัสผ่านไม่ถูกต้อง')
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  // Must be set in .env (see .env.example) — a hardcoded fallback would let anyone forge sessions
  secret: process.env.NEXTAUTH_SECRET
}
