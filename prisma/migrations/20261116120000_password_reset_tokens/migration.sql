-- Password reset tokens use the NextAuth-standard "VerificationToken" table
-- that is already declared in schema.prisma. Earlier databases were created
-- without a baseline migration, so create the table only if it is missing.
-- Safe to run on a database that already has it.

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
