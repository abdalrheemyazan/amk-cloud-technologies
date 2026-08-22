"use client";

import type { SupportAgentProfile } from "@/lib/support-profile";
import PreparedResponsesManager from "./PreparedResponsesManager";

export default function CannedRepliesSection({
  agentName: _agentName,
  profile,
}: {
  agentName: string | null;
  profile?: SupportAgentProfile;
}) {
  return (
    <PreparedResponsesManager
      userRole={profile?.role || "SUPPORT_AGENT"}
    />
  );
}

