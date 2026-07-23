"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import SupportSidebarContent, { type SidebarNavItemDef } from "./SupportSidebarContent";
import SupportSidebarBrand from "./SupportSidebarBrand";
import type { ReactNode } from "react";
import { DEFAULT_SUPPORT_SECTION } from "@/lib/support-types";
import type { AgentStatus } from "@/lib/support-types";

export default function SupportShell({
  userName,
  userRole,
  userImage,
  userStatus,
  activeSection = DEFAULT_SUPPORT_SECTION,
  onSelectSection,
  navItems,
  badges,
  children,
}: {
  userName: string | null;
  userRole: string | null;
  userImage?: string | null;
  userStatus?: AgentStatus;
  activeSection?: string;
  onSelectSection?: (section: string) => void;
  navItems?: SidebarNavItemDef[];
  badges?: Record<string, number>;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSelect = (section: string) => {
    onSelectSection?.(section);
    setMobileNavOpen(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F4F7FB] lg:flex">
      {/* Desktop sidebar */}
      <aside className="support-sidebar-in hidden shrink-0 border-l border-[#E2E8F0] bg-white lg:sticky lg:top-0 lg:z-40 lg:flex lg:h-screen lg:w-64">
        <SupportSidebarContent
          userName={userName}
          userRole={userRole}
          userImage={userImage}
          userStatus={userStatus}
          activeSection={activeSection}
          onSelectSection={handleSelect}
          navItems={navItems}
          badges={badges}
        />
      </aside>

      {/* Mobile top bar with menu toggle */}
      <div className="support-sidebar-in flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-3 lg:hidden">
        <SupportSidebarBrand compact />
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
            data-support-motion
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
              data-support-motion
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
              <SupportSidebarContent
                userName={userName}
                userRole={userRole}
                userImage={userImage}
                userStatus={userStatus}
                activeSection={activeSection}
                onSelectSection={handleSelect}
                navItems={navItems}
                badges={badges}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <main className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
