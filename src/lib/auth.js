import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "./mongodb";
import User from "../models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDB();
          
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.profileImage,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? 'tunalismus.in' : undefined
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? 'tunalismus.in' : undefined
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? 'tunalismus.in' : undefined
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🔑 JWT callback - user:', user ? { id: user.id, role: user.role, email: user.email } : 'no user');
      console.log('🔑 JWT callback - token before:', { sub: token.sub, role: token.role, email: token.email });
      
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      console.log('🔑 JWT callback - token after:', { sub: token.sub, role: token.role, email: token.email });
      return token;
    },
    async session({ session, token }) {
      console.log('📋 Session callback - token:', { sub: token.sub, role: token.role, email: token.email });
      console.log('📋 Session callback - session before:', { userId: session.user?.id, role: session.user?.role, email: session.user?.email });
      
      if (token) {
        session.user.id = token.sub || token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      
      console.log('📋 Session callback - session after:', { userId: session.user?.id, role: session.user?.role, email: session.user?.email });
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signOut({ token }) {
      console.log('🔓 User signed out:', token?.email);
    },
  },
};

// Authorization helper function
export function authorize(requiredRole, userRole) {
  if (!userRole) return false;
  
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  // Check if user role matches required role
  return userRole === requiredRole;
}

export default NextAuth(authOptions);