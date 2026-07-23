"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_PROFILE_SELECT,
  customerProfileFromUser,
  getCustomerProfileById,
  type CustomerProfile,
} from "@/lib/customer-profile-data";

export type { CustomerProfile } from "@/lib/customer-profile-data";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const GENERIC_ERROR = "לא ניתן לשמור את הפרטים כרגע. נסה שוב בעוד מספר רגעים.";
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;
const PROFILE_IMAGE_DATA_URL = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

export type CustomerProfileInput = {
  name: string;
  displayName: string;
  phone: string;
  preferredLanguage: string;
  profileImageDataUrl?: string | null;
  removeProfileImage?: boolean;
  companyName: string;
  companyIdNumber: string;
  companyRole: string;
  companyAddress: string;
  companyPhone: string;
  technicalContact: string;
  technicalEmail: string;
  businessField: string;
  employeeCount: string;
  serviceNotes: string;
  notifyEmailUpdates: boolean;
  notifyRequestUpdates: boolean;
  notifyMaintenanceAlerts: boolean;
  notifyDocumentUpdates: boolean;
};

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return { id: session.user.id as string };
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validateProfileImage(
  value: unknown,
): { ok: true; dataUrl: string | null } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, dataUrl: null };
  }
  if (typeof value !== "string") {
    return { ok: false, error: "תמונת הפרופיל אינה תקינה." };
  }

  const match = PROFILE_IMAGE_DATA_URL.exec(value);
  if (!match) {
    return { ok: false, error: "סוג הקובץ אינו נתמך. ניתן להעלות JPG, PNG או WEBP בלבד." };
  }

  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length === 0 || bytes.length > MAX_PROFILE_IMAGE_BYTES) {
    return { ok: false, error: "הקובץ גדול מדי. ניתן להעלות תמונה עד 2MB." };
  }

  const mimeType = match[1];
  const isPng =
    mimeType === "png" &&
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg =
    mimeType === "jpeg" && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp =
    mimeType === "webp" &&
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP";

  if (!isPng && !isJpeg && !isWebp) {
    return { ok: false, error: "סוג הקובץ אינו נתמך. ניתן להעלות JPG, PNG או WEBP בלבד." };
  }

  return { ok: true, dataUrl: value };
}

export async function getMyCustomerProfile(): Promise<ActionResult<CustomerProfile>> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const profile = await getCustomerProfileById(user.id);
    if (!profile) return { ok: false, error: "UNAUTHORIZED" };

    return { ok: true, data: profile };
  } catch (error) {
    console.error("getMyCustomerProfile failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function updateMyCustomerProfile(
  input: CustomerProfileInput,
): Promise<ActionResult<CustomerProfile>> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const name = text(input.name, 80);
  const displayName = text(input.displayName, 60);
  if (!name) {
    return { ok: false, error: "יש למלא שם מלא." };
  }

  const profileImage = validateProfileImage(input.profileImageDataUrl);
  if (!profileImage.ok) {
    return { ok: false, error: profileImage.error };
  }
  if (input.removeProfileImage && profileImage.dataUrl) {
    return { ok: false, error: "לא ניתן להעלות ולהסיר תמונה באותה פעולה." };
  }

  try {
    const dbUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        displayName: displayName || null,
        phone: text(input.phone, 30) || null,
        preferredLanguage: text(input.preferredLanguage, 10) || "he",
        companyName: text(input.companyName, 120) || null,
        companyIdNumber: text(input.companyIdNumber, 40) || null,
        companyRole: text(input.companyRole, 80) || null,
        companyAddress: text(input.companyAddress, 200) || null,
        companyPhone: text(input.companyPhone, 30) || null,
        technicalContact: text(input.technicalContact, 80) || null,
        technicalEmail: text(input.technicalEmail, 120) || null,
        businessField: text(input.businessField, 80) || null,
        employeeCount: text(input.employeeCount, 20) || null,
        serviceNotes: text(input.serviceNotes, 2000) || null,
        emailNotifications: Boolean(input.notifyEmailUpdates),
        notifyRequestUpdates: Boolean(input.notifyRequestUpdates),
        notifyMaintenanceAlerts: Boolean(input.notifyMaintenanceAlerts),
        notifyDocumentUpdates: Boolean(input.notifyDocumentUpdates),
        ...(input.removeProfileImage
          ? { profileImageUrl: null }
          : profileImage.dataUrl
            ? { profileImageUrl: profileImage.dataUrl }
            : {}),
      },
      select: CUSTOMER_PROFILE_SELECT,
    });

    revalidatePath("/portal");
    return { ok: true, data: customerProfileFromUser(dbUser) };
  } catch (error) {
    console.error("updateMyCustomerProfile failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
