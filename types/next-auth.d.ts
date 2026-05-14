import { RoleSlug } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      roleSlug: RoleSlug;
    };
  }

  interface User {
    roleSlug: RoleSlug;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleSlug?: RoleSlug;
  }
}
