import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";

const lastUpdated = "26 سبتمبر 2026";

function LegalShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#fbf8f3] text-[#202b2d]" dir="rtl">
    <header className="border-b border-[#eadfd2] bg-[#fbf8f3]/95 px-5 py-4 backdrop-blur lg:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3"><img src="/manus-storage/bagvora-logo_7cd0a86f.png" alt="BagVora" className="brand-logo" /></Link>
        <Link href="/" className="text-button"><ArrowRight size={16} /> العودة للمتجر</Link>
      </div>
    </header>
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="mb-10 border-b border-[#eadfd2] pb-8"><div className="eyebrow">{eyebrow}</div><h1 className="mt-4 text-4xl font-bold tracking-tight text-[#202b2d] sm:text-5xl">{title}</h1><p className="mt-4 text-sm text-[#8b8077]">آخر تحديث: {lastUpdated}</p></div>
      <div className="legal-content">{children}</div>
    </main>
    <footer className="border-t border-[#eadfd2] px-5 py-7 text-center text-xs text-[#8b8077]">BagVora — نحمل قصتك · <a href="mailto:bagvora26@gmail.com" className="text-[#ae785c]">bagvora26@gmail.com</a> · <a href="https://wa.me/201224173736" className="text-[#ae785c]">01224173736</a></footer>
  </div>;
}

export function PrivacyPolicy() {
  return <LegalShell title="سياسة الخصوصية" eyebrow="خصوصيتك أولاً">
    <div className="legal-callout"><ShieldCheck size={22} /><p>نحترم خصوصيتك ونسعى إلى استخدام بياناتك فقط لتقديم تجربة شراء موثوقة، تنفيذ الطلبات، وتحسين خدمات BagVora.</p></div>
    <section><h2>1. البيانات التي نجمعها</h2><p>عند تنفيذ طلب أو التواصل معنا قد نجمع الاسم، رقم الهاتف، عنوان التوصيل، تفاصيل المنتجات المطلوبة، وسجل التواصل المرتبط بالطلب. وقد نجمع بيانات تقنية محدودة مثل نوع المتصفح والصفحات التي تمت زيارتها لتحسين أداء الموقع.</p></section>
    <section><h2>2. كيف نستخدم البيانات</h2><p>نستخدم البيانات لمعالجة الطلبات، التواصل لتأكيد العنوان، تنسيق التوصيل، متابعة حالة الشحن، الرد على الاستفسارات، منع إساءة الاستخدام، وتحسين المنتجات والخدمات. لا نستخدم بياناتك لإرسال عروض تسويقية غير مرغوبة دون أساس مشروع أو موافقة مناسبة.</p></section>
    <section><h2>3. مشاركة البيانات مع الشركاء</h2><p>قد نشارك الحد الأدنى اللازم من بيانات الطلب مع شركة الشحن أو مورّد الدروبشيبينغ لتنفيذ التسليم. لا نبيع بيانات العملاء. يلتزم الشركاء باستخدام البيانات لغرض تنفيذ الخدمة فقط وفق ترتيباتهم وسياساتهم المعمول بها.</p></section>
    <section><h2>4. التخزين والحماية</h2><p>نطبّق ضوابط وصول حسب الدور، ونخفي بيانات التكلفة عن الواجهة العامة، ونسجل التعديلات الإدارية الحساسة. مع ذلك لا توجد وسيلة نقل أو تخزين عبر الإنترنت تضمن أماناً مطلقاً، لذلك نراجع صلاحيات العاملين ونحذف البيانات التي لم تعد لازمة وفق الحاجة التشغيلية.</p></section>
    <section><h2>5. ملفات الارتباط والتحليلات</h2><p>قد يستخدم الموقع ملفات ارتباط أساسية للحفاظ على الجلسة وتحسين الوظائف. وقد تُستخدم أدوات تحليل مجهولة أو مجمّعة لفهم أداء الصفحات. يمكنك ضبط ملفات الارتباط من إعدادات متصفحك، مع احتمال تأثر بعض الوظائف.</p></section>
    <section><h2>6. حقوقك</h2><p>يمكنك طلب معرفة البيانات المرتبطة بطلبك، تصحيحها، أو طلب حذفها عندما لا توجد حاجة قانونية أو تشغيلية للاحتفاظ بها. للتواصل أرسل طلبك إلى <a href="mailto:bagvora26@gmail.com">bagvora26@gmail.com</a> أو واتساب <a href="https://wa.me/201224173736">01224173736</a>.</p></section>
    <section><h2>7. تحديث السياسة</h2><p>قد نحدّث هذه السياسة عند إضافة خدمات أو تغيّر المتطلبات. سنعرض تاريخ آخر تحديث في أعلى الصفحة، ويُعد استمرار استخدام الموقع بعد التحديث قبولاً بالنص المعدل بالقدر المسموح به.</p></section>
  </LegalShell>;
}

export function TermsOfService() {
  return <LegalShell title="الشروط والأحكام" eyebrow="تسوق بثقة">
    <div className="legal-callout"><CheckCircle2 size={22} /><p>باستخدام متجر BagVora أو إتمام طلب، تقر بأنك قرأت هذه الشروط وتوافق على تطبيقها على عملية الشراء.</p></div>
    <section><h2>1. المنتجات والأسعار</h2><p>نحاول عرض صور ووصف وأسعار دقيقة للمنتجات. قد تختلف الألوان قليلاً حسب الشاشة، وقد تتغير الأسعار أو التوفر قبل تأكيد الطلب. السعر النهائي الموضح عند تأكيد الطلب هو السعر المعتمد، ما لم يتم التواصل معك لتصحيح خطأ واضح.</p></section>
    <section><h2>2. الطلب والتأكيد</h2><p>إرسال بيانات الطلب لا يعني قبوله نهائياً. نتواصل مع العميل لتأكيد رقم الهاتف والعنوان والمنتجات والتكلفة. يحق لـ BagVora رفض أو إلغاء طلب غير قابل للتنفيذ أو يحتوي على بيانات غير صحيحة، مع توضيح السبب قدر الإمكان.</p></section>
    <section><h2>3. التوصيل والدروبشيبينغ</h2><p>تختلف مدة التوصيل حسب المدينة والمصدر وشركة الشحن. في منتجات الدروبشيبينغ قد يتم الشحن مباشرة من مورّد أو شريك، وتُشارك بيانات التسليم الضرورية فقط. يتم إرسال تحديثات الحالة عند توفرها من الشريك.</p></section>
    <section><h2>4. الدفع والاستلام</h2><p>تُعرض طرق الدفع المتاحة وقت الطلب. في الدفع عند الاستلام يجب توفير رقم هاتف صحيح واستلام الطلب في العنوان المؤكد. لا تطلب BagVora كلمات مرور أو رموز تحقق شخصية عبر الرسائل.</p></section>
    <section><h2>5. الاستبدال والمرتجعات</h2><p>يجب التواصل معنا سريعاً عند وجود عيب أو اختلاف جوهري. تُراجع كل حالة حسب طبيعة المنتج وحالته ومرحلة الشحن. يجب الحفاظ على المنتج والتغليف قدر الإمكان وتقديم رقم الطلب وصور واضحة عند طلب الدعم.</p></section>
    <section><h2>6. المحتوى والصور من العملاء</h2><p>عند إرسال صورة أو مراجعة للمنتج، تمنح BagVora إذناً غير حصري لاستخدامها في عرض تجربة العملاء أو الترويج للموقع، مع احترام اسمك وخصوصيتك. يمكنك طلب إزالة المحتوى عبر البريد الإداري.</p></section>
    <section><h2>7. التواصل</h2><p>للاستفسارات أو الشكاوى: <a href="mailto:bagvora26@gmail.com">bagvora26@gmail.com</a>، الهاتف <a href="tel:01039286055">01039286055</a>، واتساب <a href="https://wa.me/201224173736">01224173736</a>.</p></section>
  </LegalShell>;
}
