import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
 
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        idNumber: { label: "ID number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.idNumber || !credentials?.password) {
          return null;
        }
 
        const user = await prisma.user.findUnique({
          where: { idNumber: credentials.idNumber },
        });
 
        if (!user) {
          return null;
        }
 
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
 
        if (!isValidPassword) {
          return null;
        }
 
        return {
          id: user.id,
          name: user.name,
          idNumber: user.idNumber,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.idNumber = user.idNumber;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.idNumber = token.idNumber;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
