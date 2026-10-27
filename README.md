# Medical QR Safety Bracelet

نسخة قابلة للنشر مجانًا على Cloudflare Pages مع Cloudflare D1. الواجهة تُقدّم من `public/`، وواجهات API تعمل عبر Pages Functions في `functions/`، والبيانات تحفظ في D1. لا ترفع مجلد `data` أو أي قاعدة SQLite محلية.

## إعداد Cloudflare Pages

1. في Cloudflare Dashboard افتح **Workers & Pages → Create application → Pages → Import an existing Git repository**.
2. اختر المستودع `domzz777/isef` والفرع `deploy/cloudflare-d1`.
3. استخدم الإعدادات التالية: Framework preset **None**, Build command `exit 0`, Build output directory `public`.
4. أنشئ قاعدة D1 باسم `medical-qr-db`، ثم افتح Console فيها ونفّذ SQL الموجود في `migrations/0001_profiles.sql` مرة واحدة.
5. في مشروع Pages افتح **Settings → Bindings → Add → D1 database**. سمّ binding باسم `DB` واختر `medical-qr-db`، ثم أعد النشر.
6. في **Settings → Variables and Secrets** عيّن `ADMIN_USER` وأنشئ سرًا `ADMIN_PASSWORD`، ثم أعد النشر. احفظ كلمة المرور ولا ترفعها إلى GitHub.
7. افتح رابط `*.pages.dev`، سجّل الدخول إلى لوحة الإدارة، أضف الملف، ثم أنشئ QR جديدًا. الرابط العام سيعمل على الموبايل.

Cloudflare D1 يتضمن خطة مجانية بحدود يومية وحد تخزين؛ إذا تجاوز الموقع حدود الخطة، تتوقف استعلامات قاعدة البيانات حتى إعادة الضبط أو الترقية. راجع [تفاصيل D1 الرسمية](https://developers.cloudflare.com/d1/platform/pricing/). صفحة QR عامة لمن يملك الرابط، وتعرض حقول الطوارئ فقط.

## تطوير محلي

الخادم `server.js` خيار محلي يستخدم SQLite، وليس جزءًا من نشر Cloudflare. لتشغيله، استخدم Node.js 22.13 أو أحدث واضبط `ADMIN_USER` و`ADMIN_PASSWORD`، ثم شغّل `node server.js` وافتح `http://localhost:3000`.

## الملفات الأساسية

- `functions/`: API لـCloudflare Pages Functions.
- `migrations/0001_profiles.sql`: إنشاء جدول D1.
- `public/`: ملفات الموقع المنشورة.
- `server.js`: خادم SQLite للتطوير المحلي فقط.
