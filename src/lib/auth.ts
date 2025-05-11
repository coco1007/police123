import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './mongodb';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('아이디와 비밀번호를 입력해주세요.');
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne({ username: credentials.username });

        if (!user) {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }

        return {
          id: user._id.toString(),
          name: user.username,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 