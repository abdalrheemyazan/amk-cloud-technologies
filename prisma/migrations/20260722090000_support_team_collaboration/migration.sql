-- Dedicated staff-only collaboration, transfer audit, and customer-visible activity channels.
CREATE TYPE "SupportTransferStatus" AS ENUM ('COMPLETED', 'CANCELLED');

CREATE TABLE "InternalSupportMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "sessionId" TEXT,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InternalSupportMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTransfer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "fromAgentId" TEXT NOT NULL,
    "toAgentId" TEXT NOT NULL,
    "note" TEXT,
    "status" "SupportTransferStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportTransfer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportActivity" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InternalSupportMessage_senderId_recipientId_createdAt_idx" ON "InternalSupportMessage"("senderId", "recipientId", "createdAt");
CREATE INDEX "InternalSupportMessage_recipientId_readAt_createdAt_idx" ON "InternalSupportMessage"("recipientId", "readAt", "createdAt");
CREATE INDEX "InternalSupportMessage_sessionId_createdAt_idx" ON "InternalSupportMessage"("sessionId", "createdAt");
CREATE INDEX "SupportTransfer_sessionId_createdAt_idx" ON "SupportTransfer"("sessionId", "createdAt");
CREATE INDEX "SupportTransfer_toAgentId_createdAt_idx" ON "SupportTransfer"("toAgentId", "createdAt");
CREATE INDEX "SupportActivity_sessionId_createdAt_idx" ON "SupportActivity"("sessionId", "createdAt");

ALTER TABLE "InternalSupportMessage" ADD CONSTRAINT "InternalSupportMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InternalSupportMessage" ADD CONSTRAINT "InternalSupportMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InternalSupportMessage" ADD CONSTRAINT "InternalSupportMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SupportSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTransfer" ADD CONSTRAINT "SupportTransfer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SupportSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTransfer" ADD CONSTRAINT "SupportTransfer_fromAgentId_fkey" FOREIGN KEY ("fromAgentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupportTransfer" ADD CONSTRAINT "SupportTransfer_toAgentId_fkey" FOREIGN KEY ("toAgentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupportActivity" ADD CONSTRAINT "SupportActivity_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SupportSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportActivity" ADD CONSTRAINT "SupportActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
