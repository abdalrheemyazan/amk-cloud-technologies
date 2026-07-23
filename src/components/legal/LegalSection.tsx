export default function LegalSection({
  id,
  title,
  index,
  children,
}: {
  id: string;
  title: string;
  index?: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8 border-b border-slate-100 pb-8 last:border-b-0 last:pb-0">
      <div className="mb-3 flex items-baseline gap-3">
        {typeof index === "number" ? (
          <span className="font-mono text-[10px] font-bold tabular-nums text-slate-400" dir="ltr">
            {String(index).padStart(2, "0")}
          </span>
        ) : null}
        <h2 id={`${id}-title`} className="text-lg font-black tracking-tight text-[#0B1739] md:text-xl">
          {title}
        </h2>
      </div>
      <div className="space-y-3 text-sm font-medium leading-7 text-slate-700 marker:text-blue-500 md:text-[15px] md:leading-8">
        {children}
      </div>
    </section>
  );
}
