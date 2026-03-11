# Jood Kids Store

متجر جملة ثابت جاهز للنشر على GitHub Pages مع Firebase + Cloudinary + PWA.

## محتويات المشروع
- واجهة متجر عربية RTL
- لوحة إدارة مخفية عند الضغط على اللوجو
- إدارة كاملة للواجهة، بيانات الشركة، التصنيفات، المنتجات، والطلبات
- رفع صور مباشر إلى Cloudinary
- استيراد وتصدير Excel
- سلة + إرسال الطلب إلى واتساب + حفظ الطلب في Firestore
- تطبيق قابل للتثبيت PWA

## قبل التشغيل
1. فعّل **Email/Password** داخل Firebase Authentication.
2. أنشئ مستخدم الإدارة بالحساب الذي يطابق UID التالي:
   - `dZS7jUaB43aCL5Km3zr5V4LZuMr1`
3. أنشئ قاعدة Firestore وانشر الملف `firestore.rules`.
4. في Cloudinary أنشئ **Unsigned Upload Preset** للحساب:
   - Cloud Name: `dthtzvypx`
5. بعد تسجيل دخول الإدارة افتح لوحة التحكم وأضف قيمة **Cloudinary Upload Preset**.

## النشر على GitHub Pages
1. ارفع كل الملفات داخل هذا المشروع إلى مستودع GitHub.
2. من إعدادات المستودع فعّل GitHub Pages من الفرع الرئيسي أو من مجلد الجذر.
3. افتح رابط الموقع بعد النشر.
4. اضغط على اللوجو للدخول إلى لوحة الإدارة.

## المجموعات المستخدمة في Firestore
- `products`
- `categories`
- `orders`
- `company/main`
- `settings/storefront`
- `settings/store`
- `payments/default`
- `shipping/default`

## استيراد Excel
استخدم الملف:
- `sample-products-template.xlsx`

الأعمدة المدعومة:
- `name`
- `model`
- `priceWholesale`
- `season`
- `stock`
- `sizes`
- `minQty`
- `badgeText`
- `pinned`
- `visible`
- `description`
- `image1` إلى `image6`

## ملاحظات تشغيلية
- التصنيف البرمجي يُشتق تلقائياً من رقم الموديل.
- إذا كان الموديل أقل من 1000 يأخذ أول رقم.
- إذا كان 1000 أو أكثر يأخذ أول رقمين.
- الطلبات تحفظ في Firestore وتُرسل أيضاً إلى واتساب.


## نسخة Luxe
هذه النسخة تقدم واجهة براند أفخم بصريًا مع الحفاظ على نفس منطق Firebase وCloudinary ولوحة التحكم.
