// This page contains general template text and must be reviewed by a qualified Israeli lawyer before production launch.

import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalSection from "@/components/legal/LegalSection";
import LegalNotice from "@/components/legal/LegalNotice";

export const metadata: Metadata = {
  title: "הצהרת נגישות | AMK Cloud Technologies",
  description: "הצהרת הנגישות של אתר AMK Cloud Technologies.",
};

// Update manually whenever the accessibility statement content changes.
const LAST_UPDATED = "21.07.2026";

const TOC = [
  { id: "adjustments", label: "התאמות נגישות באתר" },
  { id: "toolbar", label: "כלי נגישות" },
  { id: "known-limitations", label: "מגבלות ידועות" },
  { id: "contact", label: "פנייה בנושא נגישות" },
];

export default function AccessibilityPage() {
  return (
    <LegalPageLayout
      title="הצהרת נגישות"
      description="AMK Cloud Technologies פועלת להנגשת האתר והשירותים הדיגיטליים שלה עבור כלל המשתמשים, לרבות אנשים עם מוגבלויות."
      tocItems={TOC}
      tone="accessibility"
      updatedAt={LAST_UPDATED}
    >
      <LegalNotice variant="info">
        האתר נמצא בתהליך התאמה לדרישות הנגישות המקובלות, לרבות עקרונות WCAG ברמת AA ככל הניתן.
      </LegalNotice>

      <LegalSection id="adjustments" title="התאמות נגישות באתר" index={1}>
        <ul className="list-disc pr-5 space-y-1.5">
          <li>ניווט באמצעות מקלדת</li>
          <li>ניגודיות צבעים</li>
          <li>טקסטים ברורים</li>
          <li>כפתורי פעולה ברורים</li>
          <li>תמיכה מלאה בכיווניות RTL</li>
          <li>כלי נגישות ייעודי באתר</li>
        </ul>
      </LegalSection>

      <LegalSection id="toolbar" title="כלי נגישות" index={2}>
        <p>האתר כולל כלי נגישות עם האפשרויות הבאות:</p>
        <ul className="list-disc pr-5 space-y-1.5">
          <li>הגדלת טקסט</li>
          <li>ניגודיות גבוהה</li>
          <li>הדגשת קישורים</li>
          <li>גופן קריא</li>
          <li>עצירת אנימציות</li>
          <li>גווני אפור</li>
          <li>סימון פוקוס מקלדת</li>
          <li>איפוס הגדרות</li>
        </ul>
      </LegalSection>

      <LegalSection id="known-limitations" title="מגבלות ידועות" index={3}>
        <LegalNotice variant="warning">
          ייתכן שחלקים מסוימים באתר עדיין נמצאים בתהליך שיפור והתאמה. אם נתקלת בבעיה, נשמח לקבל דיווח ולטפל
          בה בהקדם.
        </LegalNotice>
      </LegalSection>

      <LegalSection id="contact" title="פנייה בנושא נגישות" index={4}>
        <p>אם נתקלת בקושי בגלישה באתר או בשימוש בשירות, ניתן לפנות אלינו:</p>
        <LegalNotice variant="todo">
          accessibility@amk-cloud.com
          <br />
          TODO: Replace with official accessibility contact email.
        </LegalNotice>
        <p className="text-xs text-[#94A3B8] font-semibold pt-2">תאריך עדכון אחרון: {LAST_UPDATED}</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
