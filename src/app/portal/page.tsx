import type { Metadata } from "next";
import CustomerPortalRoute from "@/components/portal/CustomerPortalRoute";

export const metadata: Metadata = {
  title: "אזור הלקוח של AMK | AMK Cloud Technologies",
  description: "נהל את השירותים שלך, עקוב אחר פניות וקבל תמיכה במקום אחד.",
};

export default function CustomerPortalPage() {
  return <CustomerPortalRoute activeSection="overview" />;
}
