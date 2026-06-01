import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "SUPPORT_AGENT" | "CLOUD_ENGINEER" | "TEAM_LEADER" | "ADMINISTRATOR" | "TECHNICIAN";
      status: "PENDING" | "ACTIVE" | "REJECTED";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "CUSTOMER" | "SUPPORT_AGENT" | "CLOUD_ENGINEER" | "TEAM_LEADER" | "ADMINISTRATOR" | "TECHNICIAN";
    status: "PENDING" | "ACTIVE" | "REJECTED";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "SUPPORT_AGENT" | "CLOUD_ENGINEER" | "TEAM_LEADER" | "ADMINISTRATOR" | "TECHNICIAN";
    status: "PENDING" | "ACTIVE" | "REJECTED";
  }
}
