export default function PortalLoading() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F4F7FB] lg:flex">
      <aside className="hidden shrink-0 border-l border-[#E2E8F0] bg-white lg:flex lg:h-screen lg:w-64" />

      <div className="min-w-0 flex-1">
        <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 md:px-8 md:py-8 animate-pulse">
          <div className="h-32 rounded-[24px] border border-[#E2E8F0] bg-white" />

          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[130px] rounded-[20px] border border-[#E2E8F0] bg-white p-4">
                <div className="mb-3 h-9 w-9 rounded-xl bg-[#E2E8F0]" />
                <div className="h-6 w-12 rounded bg-[#E2E8F0]" />
              </div>
            ))}
          </div>

          <div className="h-56 rounded-[20px] border border-[#E2E8F0] bg-white" />
        </main>
      </div>
    </div>
  );
}
