import LegalNotice from "./LegalNotice";
import LegalSection from "./LegalSection";
import type { PolicyDocumentKey } from "@/lib/policy-documents";

const LIST_CLASS = "list-disc space-y-1.5 pr-5";

function PrivacyContent() {
  return (
    <>
      <LegalSection id="collected-info" title="מידע שאנו אוספים" index={1}>
        <p>במסגרת השימוש באתר ובמערכת התמיכה, אנו עשויים לאסוף את סוגי המידע הבאים:</p>
        <ul className={LIST_CLASS}>
          <li>שם מלא, כתובת אימייל, מספר טלפון ושם חברה</li>
          <li>פרטי התחברות ונתוני חשבון</li>
          <li>פניות תמיכה, הודעות צ׳אט ופרטים טכניים שנמסרו במהלך הטיפול</li>
          <li>כתובת IP ונתוני שימוש בסיסיים, אם וכאשר רלוונטי</li>
        </ul>
      </LegalSection>

      <LegalSection id="purposes" title="מטרות השימוש במידע" index={2}>
        <p>המידע שנאסף משמש לניהול החשבון, מתן תמיכה, טיפול בפניות ושיפור השירות.</p>
        <ul className={LIST_CLASS}>
          <li>אימות משתמשים ואבטחת המערכת</li>
          <li>יצירת קשר עם המשתמש והמשך טיפול בפנייה</li>
          <li>שמירת היסטוריית תמיכה זמנית לצורכי בקרה ושירות</li>
        </ul>
      </LegalSection>

      <LegalSection id="retention" title="שמירת שיחות תמיכה" index={3}>
        <LegalNotice variant="info">
          שיחות תמיכה נשמרות למשך 7 ימים בלבד לצורך המשך טיפול, בקרה ושיפור השירות. לאחר מכן הן יימחקו
          או לא יוצגו במערכת, אלא אם קיימת חובה חוקית לשמור מידע מסוים.
        </LegalNotice>
      </LegalSection>

      <LegalSection id="third-parties" title="שיתוף מידע עם צדדים שלישיים" index={4}>
        <p>
          לצורך תפעול השירות אנו עשויים להיעזר בספקי אחסון, מסדי נתונים, אימות משתמשים ודואר אלקטרוני.
          מידע נמסר רק במידה הנדרשת להפעלת השירות ובהתאם להתחייבויות אבטחה וסודיות.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies" index={5}>
        <ul className={LIST_CLASS}>
          <li>האתר משתמש ב-Cookies הכרחיים לצורך התחברות וניהול הפעלת משתמש.</li>
          <li>שימוש עתידי בכלי אנליטיקה יעודכן במפורש במסמך זה.</li>
          <li>ניתן לשלוט ב-Cookies דרך הגדרות הדפדפן.</li>
        </ul>
      </LegalSection>

      <LegalSection id="security" title="אבטחת מידע" index={6}>
        <ul className={LIST_CLASS}>
          <li>חיבור מוצפן והרשאות גישה בהתאם לתפקיד המשתמש</li>
          <li>שמירת סיסמאות בצורה מוצפנת והגבלת גישה לגורמים מורשים</li>
          <li>אי הצגת מידע פנימי של המערכת ללקוחות</li>
        </ul>
      </LegalSection>

      <LegalSection id="rights" title="זכויות המשתמש" index={7}>
        <p>ניתן לפנות אלינו בבקשה לעיון, תיקון או מחיקת מידע אישי, בכפוף להוראות הדין.</p>
      </LegalSection>

      <LegalSection id="contact" title="יצירת קשר בנושא פרטיות" index={8}>
        <LegalNotice variant="todo">
          privacy@amk-cloud.com
          <br />
          TODO: Replace with official privacy email.
        </LegalNotice>
      </LegalSection>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <LegalSection id="acceptance" title="קבלת התנאים" index={1}>
        <p>
          הגלישה באתר והשימוש בשירותי AMK Cloud Technologies מהווים הסכמה לתנאים אלו. אם אינך מסכים להם,
          אנא הימנע משימוש באתר ובשירות.
        </p>
      </LegalSection>

      <LegalSection id="service-description" title="תיאור השירות" index={2}>
        <p>AMK מספקת שירותי ענן, תמיכה טכנית, צ׳אט תמיכה, גישה מרחוק, VPS, Hosting, גיבוי ושחזור מידע.</p>
      </LegalSection>

      <LegalSection id="permitted-use" title="שימוש מותר" index={3}>
        <ul className={LIST_CLASS}>
          <li>יש למסור מידע נכון ומדויק.</li>
          <li>אין לפגוע בפעילות המערכת או לשלוח תוכן מזיק, פוגעני או בלתי חוקי.</li>
          <li>אין לנסות לגשת למידע שאינו מורשה למשתמש.</li>
        </ul>
      </LegalSection>

      <LegalSection id="chatbot-disclaimer" title="סיוע באמצעות העוזר החכם" index={4}>
        <LegalNotice variant="warning">
          הצ׳אט החכם מספק סיוע ראשוני בלבד ואינו התחייבות לפתרון מלא. במידת הצורך ניתן להעביר את הטיפול
          לנציג תמיכה אנושי.
        </LegalNotice>
      </LegalSection>

      <LegalSection id="human-support" title="תמיכה אנושית" index={5}>
        <ul className={LIST_CLASS}>
          <li>התמיכה ניתנת בהתאם לזמינות נציגי התמיכה.</li>
          <li>אין התחייבות למענה מיידי בכל עת.</li>
          <li>כשאין נציג זמין ניתן להשאיר פנייה להמשך טיפול.</li>
        </ul>
      </LegalSection>

      <LegalSection id="user-responsibility" title="אחריות המשתמש" index={6}>
        <p>אין לשלוח בצ׳אט סיסמאות, פרטי אשראי, מפתחות API או מידע רגיש שאינו נדרש לטיפול.</p>
      </LegalSection>

      <LegalSection id="liability" title="הגבלת אחריות" index={7}>
        <p>השירות ניתן כפי שהוא (As Is) ובהתאם לזמינות המערכות, ולא ניתן להבטיח פעילות ללא הפרעות או תקלות.</p>
      </LegalSection>

      <LegalSection id="changes" title="שינויים בשירות" index={8}>
        <p>AMK רשאית לעדכן, לשנות או להפסיק חלקים מהשירות, מהממשק או מהתכונות הזמינות.</p>
      </LegalSection>

      <LegalSection id="governing-law" title="דין וסמכות שיפוט" index={9}>
        <p>על תנאים אלו יחולו דיני מדינת ישראל.</p>
      </LegalSection>
    </>
  );
}

function CancellationContent() {
  return (
    <>
      <LegalSection id="scope" title="תחולת המדיניות" index={1}>
        <p>
          מדיניות הביטולים חלה בהתאם לסוג השירות, תנאי ההתקשרות והוראות הדין בישראל. התנאים המלאים נמסרים
          בעת רכישת שירות או חתימה על הסכם.
        </p>
      </LegalSection>

      <LegalSection id="request" title="הגשת בקשת ביטול" index={2}>
        <p>
          אופן הגשת הבקשה, פרטי הזיהוי והמועד שבו הביטול נכנס לתוקף נקבעים במסמכי השירות הרלוונטיים. מומלץ
          לשמור את אישור מסירת הבקשה לצורך מעקב.
        </p>
      </LegalSection>

      <LegalSection id="timeline" title="מועד כניסת הביטול לתוקף" index={3}>
        <p>
          מועד הפסקת השירות נקבע לאחר זיהוי החשבון ובדיקת תנאי השירות. אישור הטיפול יכלול את מועד הכניסה
          לתוקף וכל פעולה שנדרשת מהלקוח לפני סיום השירות.
        </p>
      </LegalSection>

      <LegalSection id="exceptions" title="חריגים ומגבלות" index={4}>
        <p>
          שירותים שהוקצו במיוחד, התחייבויות לתקופה קבועה או עלויות של ספק חיצוני עשויים להיות כפופים לתנאי
          ביטול ייעודיים, אם תנאים אלו נמסרו מראש במסמכי ההתקשרות.
        </p>
      </LegalSection>

      <LegalSection id="service-terms" title="תנאי השירות והדין" index={5}>
        <LegalNotice variant="warning">
          הזכאות לביטול, חיובים שטרם שולמו ומועד הפסקת השירות ייבחנו לפי הסכם השירות והדין החל. במקרה של
          סתירה, יגברו התנאים המחייבים שנמסרו ללקוח.
        </LegalNotice>
      </LegalSection>

      <LegalSection id="clarification" title="בירור לפני ביטול" index={6}>
        <p>מומלץ להכין את פרטי החשבון, השירות המבוקש לביטול והסיבה לפנייה כדי לאפשר טיפול מהיר ומדויק.</p>
      </LegalSection>

      <LegalNotice variant="todo">
        מסמך זה נמצא בהכנה משפטית ויעודכן לפני השקת שירותים בתשלום. אין בו כדי לגרוע מזכויות לפי דין.
      </LegalNotice>
    </>
  );
}

function RefundContent() {
  return (
    <>
      <LegalSection id="eligibility" title="בחינת זכאות להחזר" index={1}>
        <p>הזכאות נבחנת לפי סוג השירות, מועד הביטול, תקופת השימוש ותנאי ההתקשרות שנמסרו ללקוח.</p>
      </LegalSection>

      <LegalSection id="non-refundable" title="מקרים שאינם מזכים בהחזר" index={2}>
        <p>
          ייתכנו שירותים או רכיבים שאינם מזכים בהחזר, כגון עלויות צד שלישי או משאבים ייעודיים, רק כאשר הדבר
          נקבע בתנאי העסקה שנמסרו ללקוח ובכפוף לדין.
        </p>
      </LegalSection>

      <LegalSection id="delivered-service" title="שירות שכבר סופק" index={3}>
        <p>
          כאשר השירות כבר סופק במלואו או נעשה בו שימוש, היקף ההחזר האפשרי ייבחן לפי החלק שסופק בפועל,
          ההסכם והזכויות הקבועות בדין.
        </p>
      </LegalSection>

      <LegalSection id="review" title="תהליך בדיקה ואישור" index={4}>
        <p>הבקשה נבדקת לפי פרטי החשבון והעסקה. ייתכן שיידרשו הזמנה, חשבונית או אישור ביטול להשלמת הבדיקה.</p>
      </LegalSection>

      <LegalSection id="method" title="אופן ומועד ההחזר" index={5}>
        <LegalNotice variant="info">
          אופן ההחזר והמועד הצפוי נקבעים לפי תנאי העסקה, אמצעי התשלום והדין החל. פרטים מדויקים יימסרו לאחר
          בחינת הבקשה.
        </LegalNotice>
      </LegalSection>

      <LegalSection id="clarification" title="בירור בנושא החזר" index={6}>
        <p>מומלץ לציין את שם השירות, פרטי החשבון ומועד הרכישה או הביטול כדי לאפשר איתור מהיר של העסקה.</p>
      </LegalSection>

      <LegalNotice variant="todo">
        מסמך זה נמצא בהכנה משפטית ויעודכן לפני השקת שירותים בתשלום. אין בו כדי לגרוע מזכויות לפי דין.
      </LegalNotice>
    </>
  );
}

export default function PolicyDocumentContent({ policyKey }: { policyKey: PolicyDocumentKey }) {
  if (policyKey === "privacy") return <PrivacyContent />;
  if (policyKey === "terms") return <TermsContent />;
  if (policyKey === "cancellation-policy") return <CancellationContent />;
  return <RefundContent />;
}
