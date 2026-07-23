export type TaskSortKey = "priority" | "waiting" | "updated" | "status";

export const SORT_OPTIONS: { value: TaskSortKey; label: string }[] = [
  { value: "priority", label: "מיין לפי עדיפות" },
  { value: "waiting", label: "מיין לפי זמן המתנה" },
  { value: "updated", label: "מיין לפי עדכון אחרון" },
  { value: "status", label: "מיין לפי סטטוס" },
];

const PRIORITY_RANK: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

// Ranks include statuses not currently persisted by the schema (e.g. "waiting for remote
// connection") so the order stays correct if those states become real in the future.
const STATUS_RANK: Record<string, number> = {
  OPEN: 0,
  IN_PROGRESS: 1,
  WAITING_REMOTE: 2,
  WAITING_CUSTOMER: 3,
  TRANSFERRED: 4,
  RESOLVED: 5,
  CLOSED: 6,
  CANCELLED: 7,
};

const DONE_STATUSES = new Set(["RESOLVED", "CLOSED", "CANCELLED"]);

type SortableTask = {
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
};

export function sortTasks<T extends SortableTask>(tasks: T[], sortKey: TaskSortKey): T[] {
  const arr = [...tasks];

  arr.sort((a, b) => {
    const aDone = DONE_STATUSES.has(a.status) ? 1 : 0;
    const bDone = DONE_STATUSES.has(b.status) ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;

    switch (sortKey) {
      case "waiting":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "updated":
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case "status": {
        const statusDiff = (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9);
        if (statusDiff !== 0) return statusDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      case "priority":
      default: {
        const priorityDiff = (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
    }
  });

  return arr;
}
