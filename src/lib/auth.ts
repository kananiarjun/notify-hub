import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { DefaultSession } from "next-auth";
import { ObjectId } from "mongodb";
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

        // Find user in database
        const users = await getCollection<User>("users");
        const user = await users.findOne({
          email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        });

        if (!user) {
          return null;
        }

        const storedPassword =
          typeof user.password === "string" && user.password.length > 0
            ? user.password
            : // Backward compatibility for legacy records.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        const userId =
          user.id ||
          (typeof user._id === "string"
            ? user._id
            : user._id instanceof ObjectId
              ? user._id.toHexString()
              : undefined);

        if (!userId) {
          return null;
        }

        return {
          id: userId,
          email: user.email?.toLowerCase(),
          name: user.name,
          role: user.role, // pass role
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
