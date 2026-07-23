import "server-only";

import { prisma } from "@/lib/prisma";

export const CUSTOMER_PROFILE_SELECT = {
  name: true,
  displayName: true,
  email: true,
  phone: true,
  preferredLanguage: true,
  profileImageUrl: true,
  companyName: true,
  companyIdNumber: true,
  companyRole: true,
  companyAddress: true,
  companyPhone: true,
  technicalContact: true,
  technicalEmail: true,
  businessField: true,
  employeeCount: true,
  serviceNotes: true,
  emailNotifications: true,
  notifyRequestUpdates: true,
  notifyMaintenanceAlerts: true,
  notifyDocumentUpdates: true,
} as const;

type CustomerProfileRow = {
  name: string | null;
  displayName: string | null;
  email: string;
  phone: string | null;
  preferredLanguage: string | null;
  profileImageUrl: string | null;
  companyName: string | null;
  companyIdNumber: string | null;
  companyRole: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  technicalContact: string | null;
  technicalEmail: string | null;
  businessField: string | null;
  employeeCount: string | null;
  serviceNotes: string | null;
  emailNotifications: boolean;
  notifyRequestUpdates: boolean;
  notifyMaintenanceAlerts: boolean;
  notifyDocumentUpdates: boolean;
};

export type CustomerProfile = {
  name: string;
  displayName: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  profileImageUrl: string | null;
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

export function customerProfileFromUser(user: CustomerProfileRow): CustomerProfile {
  return {
    name: user.name?.trim() || "",
    displayName: user.displayName?.trim() || user.name?.trim() || "",
    email: user.email,
    phone: user.phone?.trim() || "",
    preferredLanguage: user.preferredLanguage || "he",
    profileImageUrl: user.profileImageUrl,
    companyName: user.companyName?.trim() || "",
    companyIdNumber: user.companyIdNumber?.trim() || "",
    companyRole: user.companyRole?.trim() || "",
    companyAddress: user.companyAddress?.trim() || "",
    companyPhone: user.companyPhone?.trim() || "",
    technicalContact: user.technicalContact?.trim() || "",
    technicalEmail: user.technicalEmail?.trim() || "",
    businessField: user.businessField?.trim() || "",
    employeeCount: user.employeeCount?.trim() || "",
    serviceNotes: user.serviceNotes?.trim() || "",
    notifyEmailUpdates: user.emailNotifications,
    notifyRequestUpdates: user.notifyRequestUpdates,
    notifyMaintenanceAlerts: user.notifyMaintenanceAlerts,
    notifyDocumentUpdates: user.notifyDocumentUpdates,
  };
}

export async function getCustomerProfileById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: CUSTOMER_PROFILE_SELECT,
  });
  return user ? customerProfileFromUser(user) : null;
}
