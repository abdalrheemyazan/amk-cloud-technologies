-- Speeds up the per-customer AI chat rate limit (messages by sender in a time window).
CREATE INDEX IF NOT EXISTS "SessionMessage_senderId_createdAt_idx" ON "SessionMessage"("senderId", "createdAt");
