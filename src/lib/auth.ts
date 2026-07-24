import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs"; // Need to install this
import { devLog, devPerfReset, devPerfSummary } from "./dev-perf";

const isDev = process.env.NODE_ENV === "development";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const authorizeStartedAt = performance.now();
        devPerfReset();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const email = credentials.email.trim().toLowerCase();
        let user;

        try {
          const dbStartedAt = performance.now();
          // Minimal select — the presence upsert below is the only thing that
          // needs defaultAvailabilityStatus; nothing here touches tickets,
          // messages, profile, or subscription relations.
          user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
              status: true,
              name: true,
              displayName: true,
              defaultAvailabilityStatus: true,
            },
          });
          devLog(`authorize:db-lookup-by-email ${Math.round(performance.now() - dbStartedAt)}ms`);
        } catch (error) {
          console.error("Login authorize failed:", error);
          throw new Error("DATABASE_ERROR");
        }

        if (!user) {
          throw new Error("INVALID_CREDENTIALS");
        }

        let isPasswordValid = false;
        try {
          const bcryptStartedAt = performance.now();
          isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          devLog(`authorize:bcrypt-compare ${Math.round(performance.now() - bcryptStartedAt)}ms`);
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

        // Keep every staff member visible to the support team presence service.
        if (user.role !== "CUSTOMER") {
          try {
            const presenceStartedAt = performance.now();
            await prisma.technicianPresence.upsert({
              where: { technicianId: user.id },
              update: {
                status: user.defaultAvailabilityStatus,
                lastSeenAt: new Date(),
              },
              create: {
                technicianId: user.id,
                status: user.defaultAvailabilityStatus,
                lastSeenAt: new Date(),
              },
            });
            devLog(`authorize:technician-presence-upsert ${Math.round(performance.now() - presenceStartedAt)}ms`);
          } catch (err) {
            console.error("Error setting technician login presence:", err);
          }
        }

        if (isDev) {
          const summary = devPerfSummary();
          devLog(
            `authorize:total ${Math.round(performance.now() - authorizeStartedAt)}ms | queries: ${summary?.count ?? 0}` +
              (summary?.slowest ? ` | slowest: ${summary.slowest.durationMs}ms` : ""),
          );
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName?.trim() || user.name,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const jwtStartedAt = performance.now();
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.status = user.status;
      } else if (token.id && !token.role) {
        try {
          const dbStartedAt = performance.now();
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, status: true }
          });
          devLog(`jwt:db-lookup-by-id ${Math.round(performance.now() - dbStartedAt)}ms`);
          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
          }
        } catch (err) {
          console.error("JWT db lookup error", err);
        }
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      devLog(`callback:jwt ${Math.round(performance.now() - jwtStartedAt)}ms (fresh-user: ${Boolean(user)})`);
      return token;
    },
    async session({ session, token }) {
      const sessionStartedAt = performance.now();
      if (session.user) {
        session.user.role = token.role || "CUSTOMER";
        session.user.id = token.id;
        session.user.status = token.status;
        if (token.name) {
          session.user.name = token.name;
        }
      }
      devLog(`callback:session ${Math.round(performance.now() - sessionStartedAt)}ms`);
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
