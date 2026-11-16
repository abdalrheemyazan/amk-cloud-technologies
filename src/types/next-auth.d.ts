import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "SUPPORT_AGENT" | "CLOUD_ENGINEER" | "TEAM_LEADER" | "ADMINISTRATOR" | "TECHNICIAN";
      status: "PENDING" | "ACTIVE" | "REJECTED";
      image?: string | null;
      profileImageUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "CUSTOMER" | "SUPPORT_AGENT" | "CLOUD_ENGINEER" | "TEAM_LEADER" | "ADMINISTRATOR" | "TECHNICIAN";
    status: "PENDING" | "ACTIVE" | "REJECTED";
    image?: string | null;
    profileImageUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "SUPPORT_AGENT" | "CLOUD_ENGINEER" | "TEAM_LEADER" | "ADMINISTRATOR" | "TECHNICIAN";
    status: "PENDING" | "ACTIVE" | "REJECTED";
    image?: string | null;
    picture?: string | null;
    profileImageUrl?: string | null;
    /** When role/status were last confirmed against the database (ms epoch). */
    checkedAt?: number;
  }
}
