import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

// 1) Zod schema for sign‑in
const SignInSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(rawCredentials) {
        // 2) Validate input
        const parseResult = SignInSchema.safeParse(rawCredentials || {});
        if (!parseResult.success) {
          const fieldErrors = parseResult.error.flatten().fieldErrors;
          // Pick first error message we can show
          const firstError =
            Object.values(fieldErrors)
              .flat()
              .filter(Boolean)[0] || 'Invalid credentials';
          throw new Error(firstError);
        }
        const { email, password } = parseResult.data;

        // 3) Connect and verify user
        await dbConnect();
        const user = await User.findOne({
          email,
          isActive: true,
        });
        if (!user) {
          throw new Error('Invalid email or password');
        }

        const validPwd = await bcrypt.compare(password, user.password);
        if (!validPwd) {
          throw new Error('Invalid email or password');
        }

        // 4) Update lastLogin timestamp
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // 5) Return user payload
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          reputation: user.reputation,
          questionsAsked: user.questionsAsked,
          answersGiven: user.answersGiven,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.reputation = user.reputation;
        token.questionsAsked = user.questionsAsked;
        token.answersGiven = user.answersGiven;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.reputation = token.reputation;
        session.user.questionsAsked = token.questionsAsked;
        session.user.answersGiven = token.answersGiven;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
