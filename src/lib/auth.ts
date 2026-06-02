import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs"; // Need to install this

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("INVALID_CREDENTIALS");
        }
        
        const email = credentials.email.trim().toLowerCase();
        let user;

        try {
          user = await prisma.user.findUnique({
            where: { email },
          });
        } catch (error) {
          console.error("Login authorize failed:", error);
          throw new Error("DATABASE_ERROR");
        }

        if (!user) {
          throw new Error("INVALID_CREDENTIALS");
        }

        let isPasswordValid = false;
        try {
          isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        } catch (error) {
          console.error("Login authorize failed:", error);
          throw new Error("DATABASE_ERROR");
        }

        if (!isPasswordValid) {
          throw new Error("INVALID_CREDENTIALS");
        }

        if (user.status === "PENDING") {
          throw new Error("PENDING_APPROVAL");
        }

        if (user.status === "REJECTED") {
          throw new Error("REJECTED_USER");
        }

        // Rule #1: When technician logs in, set status to ONLINE and update lastSeenAt
        if (user.role === "TECHNICIAN") {
          try {
            await prisma.technicianPresence.upsert({
              where: { technicianId: user.id },
              update: {
                status: "ONLINE",
                lastSeenAt: new Date(),
              },
              create: {
                technicianId: user.id,
                status: "ONLINE",
                lastSeenAt: new Date(),
              },
            });
          } catch (err) {
            console.error("Error setting technician login presence:", err);
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.status = (user as any).status;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).status = token.status;
        if (token.name) {
          session.user.name = token.name;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
