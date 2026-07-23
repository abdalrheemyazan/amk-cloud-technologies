-- Auto-updating support agent availability: track whether presence status is
-- workflow-driven (AUTO) or agent-pinned (MANUAL), and how many chats are active.
ALTER TABLE "TechnicianPresence"
ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'AUTO',
ADD COLUMN "activeChatsCount" INTEGER NOT NULL DEFAULT 0;
