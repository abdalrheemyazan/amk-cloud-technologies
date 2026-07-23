import "server-only";

import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// The portal layout and the active section's page both need the session on
// every request; cache() dedupes the JWT decode to once per request instead
// of running it twice.
export const getPortalSession = cache(async () => getServerSession(authOptions));
