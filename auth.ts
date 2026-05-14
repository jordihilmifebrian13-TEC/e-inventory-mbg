import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { RoleSlug } from "@prisma/client";
import prisma from "@/lib/prisma";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  LOCKOUT_MINUTES,
  MAX_LOGIN_ATTEMPTS,
} from "@/lib/constants";
import { writeAuditLog } from "@/lib/audit";
import authConfig from "@/auth.config";

const credentialsSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
  turnstileToken: z.string().optional().nullable(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Kredensial",
      credentials: {
        login: { label: "Email / Username", type: "text" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile", type: "text" },
      },
      authorize: async (credentials, request) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { login, password, turnstileToken } = parsed.data;
        const turnstile = await verifyTurnstileToken(turnstileToken);
        if (!turnstile.ok) {
          return null;
        }

        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request?.headers?.get("x-real-ip") ??
          undefined;
        const userAgent = request?.headers?.get("user-agent") ?? undefined;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: login }, { username: login }],
            isActive: true,
          },
          include: { role: true },
        });

        if (!user) {
          await writeAuditLog({
            action: "LOGIN_FAILED",
            entity: "User",
            ip,
            userAgent,
            after: { login, reason: "user_not_found" },
          });
          return null;
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await writeAuditLog({
            userId: user.id,
            role: user.role.slug,
            action: "LOGIN_BLOCKED",
            entity: "User",
            entityId: user.id,
            ip,
            userAgent,
          });
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          const attempts = user.failedLoginAttempts + 1;
          const lockedUntil =
            attempts >= MAX_LOGIN_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
              : user.lockedUntil;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: attempts,
              lockedUntil:
                attempts >= MAX_LOGIN_ATTEMPTS ? lockedUntil : user.lockedUntil,
            },
          });

          await writeAuditLog({
            userId: user.id,
            role: user.role.slug,
            action: "LOGIN_FAILED",
            entity: "User",
            entityId: user.id,
            ip,
            userAgent,
            after: { attempts },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        await writeAuditLog({
          userId: user.id,
          role: user.role.slug,
          action: "LOGIN_SUCCESS",
          entity: "User",
          entityId: user.id,
          ip,
          userAgent,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleSlug: user.role.slug as RoleSlug,
        };
      },
    }),
  ],
});
