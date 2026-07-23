// Suspense fallback for the active page only — the sidebar/user card live in
// layout.tsx and stay mounted, so this never needs to fake them.
export default function PortalLoading() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden="true">
      <div className="h-24 rounded-[20px] border border-[#E2E8F0] bg-white" />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[90px] rounded-[16px] border border-[#E2E8F0] bg-white" />
        ))}
      </div>

      <div className="space-y-2.5 rounded-[20px] border border-[#E2E8F0] bg-white p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-[#F1F5F9]" />
        ))}
      </div>
    </div>
  );
}
