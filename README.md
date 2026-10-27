# Medical QR Safety Bracelet

نموذج أولي لإدارة ملفات طوارئ. صفحات الموقع وواجهة API تعمل على Cloudflare Pages، والبيانات محفوظة في Cloudflare D1. بيانات الطوارئ العامة فقط تظهر عند فتح QR؛ `privateNotes` تظل داخل لوحة الإدارة.

## النشر على Cloudflare Pages

1. ارفع ملفات المشروع إلى مستودع GitHub، ثم افتح Cloudflare Dashboard وأنشئ تطبيق **Workers & Pages > Create application > Pages > Connect to Git** واختر المستودع `domzz777/isef`.
2. اختر **None** كإطار عمل. اترك أمر البناء فارغًا (أو استخدم `exit 0` إذا طلبت الشاشة أمرًا)، واجعل مجلد ملفات الموقع `.`. تأكد أن مجلدي `functions` و`migrations` وملف `_routes.json` موجودة في جذر المستودع.
3. أنشئ قاعدة D1 من **Storage & databases > D1**. افتح قاعدة البيانات ثم **Console**، وشغّل محتوى الملف `migrations/0001_init.sql` مرة واحدة لإنشاء الجدول.
4. في إعدادات مشروع Pages افتح **Settings > Bindings > Add > D1 database**. اكتب اسم المتغير `DB` واختر قاعدة البيانات التي أنشأتها.
5. في **Settings > Variables and Secrets** أضف `ADMIN_USER` و`ADMIN_PASSWORD` لقسم Production. اجعل كلمة المرور قوية، ولا تضعها في ملفات GitHub.
6. أعد نشر المشروع بعد إضافة الربط والمتغيرات، ثم افتح رابط `https://اسم-المشروع.pages.dev`. استخدم هذا الرابط للوحة الإدارة وQR؛ رابط GitHub Pages (`*.github.io`) لا يشغّل الـAPI.

لوحة الإدارة تطلب اسم المستخدم وكلمة المرور من نافذة المتصفح. مسارات `/api/profiles` محمية، بينما `/api/public/...` تعرض الحقول العامة اللازمة للطوارئ فقط. كل طلبات الموقع والـAPI تستخدم نفس النطاق، لذلك لا تحتاج إلى إعداد CORS.

## إعداد محلي باستخدام Node.js

1. ثبّت Node.js 22.13 أو أحدث.
2. من PowerShell داخل مجلد المشروع عيّن بيانات دخول الإدارة وشغّل الخادم:

```powershell
$env:ADMIN_USER = "admin"
$env:ADMIN_PASSWORD = "اكتب-كلمة-مرور-قوية-هنا"
node server.js
```

3. افتح `http://localhost:3000`. قاعدة SQLite المحلية تنشأ تلقائيًا في `data/medical-qr.sqlite`. لإيقاف الخادم اضغط `Ctrl+C`.

## الخصوصية

- بيانات قاعدة D1 دائمة بين عمليات النشر، لكن راجع حدود الخطة المجانية لدى Cloudflare قبل الاستخدام.
- صفحة الطوارئ عامة لمن يملك رمز QR؛ إصدار رمز جديد يبطل القديم.
- لا تدخل بيانات صحية أو شخصية حقيقية في هذا النموذج. كلمة المرور لا تجعل النظام سجلًا طبيًا معتمدًا؛ الاستخدام الواقعي يتطلب مراجعة أمنية وقانونية وإجراءات خصوصية وموافقة مناسبة.
- لا ترفع مجلد `data` أو كلمات المرور إلى GitHub.

## ملفات المشروع

- `functions/api/[[path]].js`: واجهة Pages Functions وقاعدة D1.
- `migrations/0001_init.sql`: إنشاء جدول الملفات الطبية.
- `_routes.json`: توجيه طلبات `/api/*` إلى Functions.
- `server.js`: خادم Node.js وSQLite للتشغيل المحلي أو Render.
- `app.js`, `index.html`: لوحة الإدارة.
- `public.js`, `public.html`: صفحة الطوارئ العامة.
- `style.css`: التنسيق.
- `render.yaml`: إعداد Render بديل.
