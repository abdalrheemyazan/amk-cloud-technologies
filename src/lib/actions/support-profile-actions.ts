"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";
import {
  type SupportAgentProfile,
  type SupportAgentProfileInput,
} from "@/lib/support-profile";
import {
  getSupportProfileById,
  SUPPORT_PROFILE_SELECT,
  supportProfileFromUser,
} from "@/lib/support-profile-data";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const GENERIC_ERROR = "לא ניתן לשמור את הפרטים כרגע. נסה שוב בעוד מספר רגעים.";
const ALLOWED_STATUSES = new Set(["AVAILABLE", "BUSY", "OFFLINE"]);
const MAX_PROFILE_IMAGE_BYTES = 512 * 1024;
const PROFILE_IMAGE_DATA_URL = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

async function requireStaffUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const role = session.user.role as Role;
  if (!STAFF_ROLES.includes(role)) return null;
  return { id: session.user.id as string, role };
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validateProfileImage(value: unknown):
  | { ok: true; dataUrl: string | null }
  | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, dataUrl: null };
  }
  if (typeof value !== "string") {
    return { ok: false, error: "תמונת הפרופיל אינה תקינה." };
  }

  const match = PROFILE_IMAGE_DATA_URL.exec(value);
  if (!match) {
    return { ok: false, error: "ניתן לשמור תמונת PNG, JPG או WEBP בלבד." };
  }

  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length === 0 || bytes.length > MAX_PROFILE_IMAGE_BYTES) {
    return { ok: false, error: "התמונה המעובדת גדולה מדי. נסה לבחור תמונה אחרת." };
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
    return { ok: false, error: "תוכן קובץ התמונה אינו תקין." };
  }

  return { ok: true, dataUrl: value };
}

export async function getMySupportProfile(): Promise<ActionResult<SupportAgentProfile>> {
  const staff = await requireStaffUser();
  if (!staff) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const profile = await getSupportProfileById(staff.id);
    if (!profile) {
      return { ok: false, error: "UNAUTHORIZED" };
    }

    return { ok: true, data: profile };
  } catch (error) {
    console.error("getMySupportProfile failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function updateMySupportProfile(
  input: SupportAgentProfileInput,
): Promise<ActionResult<SupportAgentProfile>> {
  const staff = await requireStaffUser();
  if (!staff) return { ok: false, error: "UNAUTHORIZED" };

  const name = text(input.name, 80);
  const displayName = text(input.displayName, 60);
  const phone = text(input.phone, 30);
  const department = text(input.department, 80);
  const specialty = text(input.specialty, 120);
  const openingMessage = text(input.openingMessage, 1000);
  const detailsRequest = text(input.detailsRequest, 1000);
  const waitingMessage = text(input.waitingMessage, 1000);
  const closingMessage = text(input.closingMessage, 1000);
  const supportLanguages = Array.isArray(input.supportLanguages)
    ? [...new Set(input.supportLanguages.map((language) => text(language, 30)).filter(Boolean))].slice(0, 8)
    : [];
  const maxActiveChats = Number(input.maxActiveChats);
  const autoAwayMinutes = input.autoAwayMinutes === null ? null : Number(input.autoAwayMinutes);
  const profileImage = validateProfileImage(input.profileImageDataUrl);

  if (!name || !displayName) {
    return { ok: false, error: "יש למלא שם מלא ושם תצוגה." };
  }
  if (!profileImage.ok) {
    return { ok: false, error: profileImage.error };
  }
  if (input.removeProfileImage && profileImage.dataUrl) {
    return { ok: false, error: "לא ניתן להעלות ולהסיר תמונה באותה פעולה." };
  }
  if (!ALLOWED_STATUSES.has(input.defaultAvailabilityStatus)) {
    return { ok: false, error: "סטטוס ברירת המחדל אינו תקין." };
  }
  if (!Number.isInteger(maxActiveChats) || maxActiveChats < 1 || maxActiveChats > 10) {
    return { ok: false, error: "מספר השיחות הפעילות חייב להיות בין 1 ל־10." };
  }
  if (
    autoAwayMinutes !== null &&
    (!Number.isInteger(autoAwayMinutes) || autoAwayMinutes < 5 || autoAwayMinutes > 240)
  ) {
    return { ok: false, error: "זמן המעבר האוטומטי חייב להיות בין 5 ל־240 דקות." };
  }

  try {
    const user = await prisma.user.update({
      where: { id: staff.id },
      data: {
        name,
        displayName,
        phone: phone || null,
        department: department || null,
        supportSpecialty: specialty || null,
        supportLanguages,
        openingMessageTemplate: openingMessage || null,
        detailsRequestTemplate: detailsRequest || null,
        waitingMessageTemplate: waitingMessage || null,
        closingMessageTemplate: closingMessage || null,
        maxActiveChats,
        defaultAvailabilityStatus: input.defaultAvailabilityStatus,
        autoAwayMinutes,
        newRequestNotifications: Boolean(input.newRequestNotifications),
        ...(input.removeProfileImage
          ? { profileImageUrl: null }
          : profileImage.dataUrl
            ? { profileImageUrl: profileImage.dataUrl }
            : {}),
      },
      select: SUPPORT_PROFILE_SELECT,
    });

    revalidatePath("/support/agent");
    return { ok: true, data: supportProfileFromUser(user) };
  } catch (error) {
    console.error("updateMySupportProfile failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
