-- Personal support-agent profile and workspace preferences.
ALTER TABLE "User"
ADD COLUMN "displayName" TEXT,
ADD COLUMN "profileImageUrl" TEXT,
ADD COLUMN "department" TEXT,
ADD COLUMN "supportSpecialty" TEXT,
ADD COLUMN "supportLanguages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "openingMessageTemplate" TEXT,
ADD COLUMN "detailsRequestTemplate" TEXT,
ADD COLUMN "waitingMessageTemplate" TEXT,
ADD COLUMN "closingMessageTemplate" TEXT,
ADD COLUMN "maxActiveChats" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "defaultAvailabilityStatus" "PresenceStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN "autoAwayMinutes" INTEGER DEFAULT 30,
ADD COLUMN "newRequestNotifications" BOOLEAN NOT NULL DEFAULT true;
