"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import CustomerPortalBrand from "./CustomerPortalBrand";
import CustomerPortalSidebarContent from "./CustomerPortalSidebarContent";
import { pathnameToSection, type CustomerSectionKey } from "@/lib/customer-portal-sections";

// Module-level (not per-instance) so it survives across mounts and can tell
// a genuine remount apart from React StrictMode's double-invoke in dev.
// Next.js app router runs Strict Mode by default in dev (since 13.5.1), which
// mounts every component twice on its very first appearance (mount -> cleanup
// -> mount) purely to surface effect bugs — that's mounts #1 and #2 below and
// is expected noise, not a remount. Only mount #3+ indicates the shell was
// actually torn down and rebuilt by a later /portal/* navigation.
let shellMountCount = 0;

export default function CustomerPortalShell({
  userName,
  userImage,
  badges,
  children,
}: {
  userName: string | null;
  userImage?: string | null;
  badges?: Partial<Record<CustomerSectionKey, number>>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const activeSection = pathnameToSection(pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    shellMountCount += 1;
    if (shellMountCount > 2) {
      console.warn(
        `[perf] CustomerPortalShell remounted (mount #${shellMountCount}) at "${pathname}" — layout should keep it mounted across /portal/* navigation.`,
      );
    } else {
      console.info(`[perf] CustomerPortalShell mounted at "${pathname}" (mount #${shellMountCount}, Strict Mode double-invoke expected here)`);
    }
    // No cleanup log on unmount by design: an unmount immediately followed by
    // a remount on navigation is exactly the bug this is meant to catch, and
    // the mount-count warning above already reports it.
  }, [pathname]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (previousPathname.current !== pathname) {
      console.info(`[perf] CustomerPortalShell navigated ${previousPathname.current} -> ${pathname} (shell stayed mounted)`);
      previousPathname.current = pathname;
    }
  }, [pathname]);

  function handleNavigate() {
    setMobileNavOpen(false);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F4F7FB] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 border-l border-[#E2E8F0] bg-white lg:sticky lg:top-0 lg:z-40 lg:flex lg:h-screen lg:w-64">
        <CustomerPortalSidebarContent
          userName={userName}
          userImage={userImage}
          activeSection={activeSection}
          badges={badges}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-3 lg:hidden">
        <CustomerPortalBrand compact />
        <button
          type="button"
          aria-label="פתיחת תפריט"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
        >
          <Menu className="h-4.5 w-4.5" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-[#0F172A]/40"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-end px-3 pt-3">
                <button
                  type="button"
                  aria-label="סגירת תפריט"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                >
                  <X className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
              </div>
              <CustomerPortalSidebarContent
                userName={userName}
                userImage={userImage}
                activeSection={activeSection}
                onNavigate={handleNavigate}
                badges={badges}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
