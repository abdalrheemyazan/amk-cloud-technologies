"use client";

import { Search } from "lucide-react";
import { SORT_OPTIONS, type TaskSortKey } from "@/lib/task-sort";

const STATUS_OPTIONS = [
  { value: "", label: "כל הסטטוסים" },
  { value: "OPEN", label: "חדש" },
  { value: "IN_PROGRESS", label: "בטיפול" },
  { value: "RESOLVED", label: "הושלם" },
  { value: "CLOSED", label: "נסגר" },
  { value: "CANCELLED", label: "בוטל" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "כל העדיפויות" },
  { value: "URGENT", label: "דחוף ביותר" },
  { value: "HIGH", label: "גבוהה" },
  { value: "MEDIUM", label: "בינונית" },
  { value: "LOW", label: "נמוכה" },
];

export type TaskFiltersState = {
  query: string;
  status: string;
  priority: string;
  category: string;
  sort: TaskSortKey;
};

export default function TaskFilters({
  value,
  onChange,
  categories,
}: {
  value: TaskFiltersState;
  onChange: (next: TaskFiltersState) => void;
  categories: string[];
}) {
  const selectClass =
    "h-9 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-[#0F172A] outline-none transition-colors hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10";

  return (
    <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
        <input
          type="search"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder="חיפוש לקוח / מספר קריאה / נושא"
          aria-label="חיפוש לקוח, מספר קריאה או נושא"
          className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
        />
      </div>

      <select
        aria-label="סינון לפי סטטוס"
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value })}
        className={selectClass}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        aria-label="סינון לפי עדיפות"
        value={value.priority}
        onChange={(e) => onChange({ ...value, priority: e.target.value })}
        className={selectClass}
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        aria-label="סינון לפי שירות"
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
        className={selectClass}
      >
        <option value="">כל השירותים</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        aria-label="מיון"
        value={value.sort}
        onChange={(e) => onChange({ ...value, sort: e.target.value as TaskSortKey })}
        className={selectClass}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
