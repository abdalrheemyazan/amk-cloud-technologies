-- Customer portal: company details and notification preferences.
ALTER TABLE "User"
ADD COLUMN "companyIdNumber" TEXT,
ADD COLUMN "companyRole" TEXT,
ADD COLUMN "companyAddress" TEXT,
ADD COLUMN "companyPhone" TEXT,
ADD COLUMN "technicalContact" TEXT,
ADD COLUMN "technicalEmail" TEXT,
ADD COLUMN "businessField" TEXT,
ADD COLUMN "employeeCount" TEXT,
ADD COLUMN "serviceNotes" TEXT,
ADD COLUMN "notifyRequestUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyMaintenanceAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyDocumentUpdates" BOOLEAN NOT NULL DEFAULT false;
