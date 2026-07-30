-- Auto-classified internal priority for customer support requests.
-- Additive and safe: new nullable columns + a new enum type. Existing
-- SupportSession rows keep priority = NULL (treated as MEDIUM in code).

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "SupportSession"
ADD COLUMN "priority" "SupportPriority",
ADD COLUMN "priorityReason" TEXT;
