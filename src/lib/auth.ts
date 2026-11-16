import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { devLog, devPerfReset, devPerfSummary } from "./dev-perf";

const isDev = process.env.NODE_ENV === "development";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

if (!googleClientId || !googleClientSecret) {
  if (isDev) {
    console.warn(
      "[auth] Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) not fully configured. Google Sign-In will not be active."
    );
  }
}

/**
 * Ensures only compact HTTP/HTTPS URLs (like Google OAuth photo < 512 bytes) are
 * stored in the JWT cookie. Base64 data URLs (which can be megabytes) must NEVER
 * be serialized into JWT cookies to prevent HTTP 431 Request Header Fields Too Large.
 */
function sanitizeJwtAvatar(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("data:") || trimmed.length > 512) {
    return null;
  }
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return null;
}

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
          const loginSelect = {
            id: true,
            email: true,
            password: true,
            role: true,
            status: true,
            name: true,
            displayName: true,
            profileImageUrl: true,
            defaultAvailabilityStatus: true,
          } as const;
          // Older accounts may be stored with mixed-case emails.
          user =
            (await prisma.user.findUnique({ where: { email }, select: loginSelect })) ??
            (await prisma.user.findFirst({
              where: { email: { equals: email, mode: "insensitive" } },
              select: loginSelect,
            }));
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
          image: sanitizeJwtAvatar(user.profileImageUrl),
          profileImageUrl: sanitizeJwtAvatar(user.profileImageUrl),
        };
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const email = user.email.trim().toLowerCase();
        const googlePhoto = user.image || (profile as { picture?: string })?.picture || null;

        try {
          const googleUserSelect = {
            id: true,
            email: true,
            role: true,
            status: true,
            name: true,
            displayName: true,
            profileImageUrl: true,
          } as const;
          // Older accounts may be stored with mixed-case emails.
          const dbUser =
            (await prisma.user.findUnique({ where: { email }, select: googleUserSelect })) ??
            (await prisma.user.findFirst({
              where: { email: { equals: email, mode: "insensitive" } },
              select: googleUserSelect,
            }));

          if (dbUser) {
            // Google sign-in must respect the same approval gate as email/password login.
            if (dbUser.status === "REJECTED") {
              return "/login?error=REJECTED_USER";
            }
            if (dbUser.status === "PENDING") {
              return "/login?error=PENDING_APPROVAL";
            }
            // Safely store Google profile picture if the AMK user has no custom avatar yet
            if (!dbUser.profileImageUrl && googlePhoto) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { profileImageUrl: googlePhoto },
              });
              dbUser.profileImageUrl = googlePhoto;
            }
          } else {
            // First-time Google sign-in: create a join request that waits for
            // admin approval, exactly like the email registration form does.
            const rawName = user.name || (profile as { name?: string })?.name || email.split("@")[0] || "לקוח Google";
            const dummyHash = await bcrypt.hash(crypto.randomUUID(), 10);

            await prisma.user.create({
              data: {
                email,
                name: rawName,
                displayName: rawName,
                profileImageUrl: googlePhoto,
                role: "CUSTOMER",
                status: "PENDING",
                password: dummyHash,
                shortMessage: "נרשם/ה באמצעות Google",
              },
              select: { id: true },
            });
            return "/login?error=PENDING_APPROVAL_NEW";
          }

          // Propagate DB user properties and sanitized avatar to NextAuth user object for the JWT callback
          user.id = dbUser.id;
          user.role = dbUser.role;
          user.status = dbUser.status;
          user.name = dbUser.displayName?.trim() || dbUser.name;
          user.image = sanitizeJwtAvatar(dbUser.profileImageUrl || googlePhoto);
          (user as { profileImageUrl?: string | null }).profileImageUrl = sanitizeJwtAvatar(dbUser.profileImageUrl || googlePhoto);
          return true;
        } catch (err) {
          console.error("[auth] Google signIn callback error:", err);
          return "/login?error=GOOGLE_SIGNIN_FAILED";
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      const jwtStartedAt = performance.now();
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.status = user.status;
        token.name = user.name;
        token.picture = sanitizeJwtAvatar((user as { profileImageUrl?: string | null }).profileImageUrl || user.image);
      } else if (!token.id || !token.role) {
        try {
          const dbStartedAt = performance.now();
          const lookupWhere = token.id
            ? { id: token.id as string }
            : token.email
            ? { email: (token.email as string).trim().toLowerCase() }
            : null;

          if (lookupWhere) {
            const dbUser = await prisma.user.findUnique({
              where: lookupWhere,
              select: { id: true, role: true, status: true, name: true, displayName: true, profileImageUrl: true },
            });
            devLog(`jwt:db-lookup ${Math.round(performance.now() - dbStartedAt)}ms`);
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role;
              token.status = dbUser.status;
              token.name = dbUser.displayName?.trim() || dbUser.name;
              token.picture = sanitizeJwtAvatar(dbUser.profileImageUrl);
            }
          }
        } catch (err) {
          console.error("JWT db lookup error", err);
        }
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if ("image" in session || "profileImageUrl" in session) {
          token.picture = sanitizeJwtAvatar(
            (session as { profileImageUrl?: string | null }).profileImageUrl ?? session.image
          );
        }
      }

      // Explicitly delete any non-standard or oversized fields from token
      delete (token as Record<string, unknown>).image;
      delete (token as Record<string, unknown>).profileImageUrl;

      devLog(`callback:jwt ${Math.round(performance.now() - jwtStartedAt)}ms (fresh-user: ${Boolean(user)})`);
      return token;
    },
    async session({ session, token }) {
      const sessionStartedAt = performance.now();
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || "CUSTOMER";
        session.user.status = token.status;
        const resolvedAvatar = (token.picture as string) || null;
        session.user.image = resolvedAvatar;
        session.user.profileImageUrl = resolvedAvatar;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
