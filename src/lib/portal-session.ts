import "server-only";

import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { devLog } from "@/lib/dev-perf";

// The portal layout and the active section's page both need the session on
// every request; cache() dedupes the JWT decode to once per request instead
// of running it twice. The dev timing log below only fires the first time
// per request — a second call in the same navigation means the cache hit
// (near-zero) and confirms getServerSession isn't running twice.
export const getPortalSession = cache(async () => {
  const startedAt = performance.now();
  const session = await getServerSession(authOptions);
  devLog(`session:decode ${Math.round(performance.now() - startedAt)}ms`);
  return session;
});
