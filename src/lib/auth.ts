import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { DefaultSession } from "next-auth";
import { getCollection } from "@/lib/mongodb";
import type { User } from "@/lib/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();

        // Get users collection
        const users = await getCollection<User>("users");

        // Find user
        const user = await users.findOne({
          email: {
            $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
          },
        });

        if (!user) {
          return null;
        }

        // Handle password (bcrypt or legacy)
        const storedPassword =
          typeof user.password === "string" && user.password.length > 0
            ? user.password
            : // backward compatibility
              ((user as any).passwordHash as string | undefined);

        if (!storedPassword) {
          return null;
        }

        const rawPassword = credentials.password as string;

        const isBcryptHash = storedPassword.startsWith("$2");

        const isPasswordValid = isBcryptHash
          ? await bcrypt.compare(rawPassword, storedPassword)
          : rawPassword === storedPassword;

        if (!isPasswordValid) {
          return null;
        }

        // Fix for MongoDB ObjectId
        const userId = user.id || user._id?.toString();

        if (!userId) {
          return null;
        }

        return {
          id: userId,
          email: user.email?.toLowerCase(),
          name: user.name,
          role: user.role || "user",
        };

      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
