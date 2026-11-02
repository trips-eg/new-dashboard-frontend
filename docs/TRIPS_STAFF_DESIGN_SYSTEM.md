# هوية TRIPS Staff في لوحة التحكم

لوحة التحكم دلوقتي بنفس هوية تطبيق TRIPS Staff (Flutter). ده بيشمل الأدمن والموردين والماسح، لأن التلاتة نفس التطبيق، والصلاحيات هي اللي بتحدد كل واحد بيشوف إيه.

التعديل في الشكل بس. ما اتغيرش أي Service أو Endpoint أو Guard أو صلاحية أو منطق حجز أو دفع.

## الملفات

| الملف | فيه إيه |
|---|---|
| `src/scss/trips-staff/_tokens.scss` | كل القيم: الألوان، المسافات، الـ Radius، الخطوط. نفس قيم `TripsColors` و`Gap` و`TripsText` في التطبيق |
| `src/scss/trips-staff/_theme.scss` | تطبيق القيم على Bootstrap وPrimeNG والـ Layout: السايدبار، الهيدر، الكروت، الجداول، الفورمز، الأزرار، الحالات، الـ Dialogs |
| `src/scss/primeng/trips-staff-theme.css` | ثيم PrimeNG متولّد من `lara-light-blue` بألوان Staff. **ما يتعدلش بإيدك** |
| `tools/build-primeng-theme.mjs` | بيولّد الملف اللي فوق. شغّله بعد أي تحديث لـ PrimeNG: `node tools/build-primeng-theme.mjs` |

`_theme.scss` آخر حاجة بتتحمّل في `styles.scss`. والمتغيرات القديمة (`--main-color`، `--thm-*`) لسه شغالة، بس بقت بتشاور على القيم الجديدة.

## الألوان

| الاستخدام | المتغير | القيمة |
|---|---|---|
| السايدبار، الروابط، الاختيار | `--ts-navy` | `#12203A` |
| زر الإجراء الأساسي، علامة الصفحة الحالية | `--ts-accent` (والنص عليه `--ts-on-accent`) | `#F28C0F` |
| خلفية الصفحة | `--ts-page` | `#F3EFE8` |
| الكروت والحقول | `--ts-surface` | `#FFFFFF` |
| الخطوط والحدود | `--ts-line` / `--ts-line-control` | `#E4DED4` / `#D0D5DD` |
| النص | `--ts-ink` / `--ts-ink-muted` / `--ts-ink-faint` | `#101828` / `#475467` / `#667085` |
| الحالات | `--ts-ok-*` و`--ts-pend-*` و`--ts-danger-*` و`--ts-canc-*` و`--ts-done-*` | زي `StatusPill` في التطبيق |
| الأقسام | `--ts-trip` و`--ts-outing` و`--ts-hajj` و`--ts-hotel` (ومع كل واحد `-bg`) | زي ألوان الأقسام في التطبيق |

## القواعد

- **الأزرار:** الزر المليان (`p-button` أو `btn-primary`) برتقالي والنص عليه غامق، وده للإجراء الأساسي بس. `p-button-outlined` و`btn-secondary` للإجراءات التانية، و`p-button-text` لإجراءات الصفوف.
- **أزرار الجداول:** مربعات فاتحة لونها بيوضّح الإجراء: كحلي للعرض، أخضر للتأكيد، أحمر للحذف.
- **الكروت:** خلفية بيضا، حد `--ts-line`، و`radius` قيمته 18px، من غير ظل تقيل.
- **الحقول:** ارتفاعها 44px و`radius` قيمته 12px. لما الحقل يتحدد، الحد بيبقى كحلي.
- **الأرقام (Bento):** استخدم `styleClass="ts-tile ts-tone-<نوع>"` على `p-card`، ومعاه `ts-tile-label` و`ts-tile-value` و`ts-tile-icon`. الأنواع المتاحة:
  - `revenue`، `success`، `expense`، `pending`، `info`، `inactive`، `brand`، `neutral`
  - `trip`، `outing`، `hajj`، `hotel`
  - مثال كامل في `vendor-detail.component.html`.
- **ما تكتبش لون Hex جوه Component.** استخدم `var(--ts-…)`.
- **البيانات بتظهر زي ما اتكتبت:** الإيميل والأسماء جوه الجداول مش بيتعملهم Capitalize.

## الشاشات اللي اتعدلت بإيد

باقي الشاشات أخدت الهوية من الثيم العام، ومن تحويل الألوان القديمة لمتغيرات `--ts-*` في ملفات الـ SCSS بتاعتها. الشاشات دي اتعدلت بإيد:

- **تسجيل الدخول:** لوحة كحلي فيها اللوجو، والفورم على ورقة بيضا. على الموبايل بقت زي التطبيق بالظبط.
- **الرئيسية** (`vendor-detail`)**:** الأرقام بقت Bento tiles، اتنين في الصف على الموبايل، والأرقام بفواصل.
- **الماسح:** فيه "محطة مسح" كحلي، فيها زر مسح كبير وحقل لرقم الحجز، وتحتها سجل المسح.
- **أزرار الإجراء في Trip Stars والتقييمات والتقارير وطلبات الرحلات المخصصة** بقت برتقالي.

## الموبايل

اتشال الـ `viewport` التاني اللي كان بيصغّر الصفحة لـ 0.9، فالصفحة دلوقتي بتتعرض بعرض الجهاز الحقيقي. اتجرب على 375 و768 و1440، بالعربي (RTL) والإنجليزي.

## الرئيسية والتحليلات زي التطبيق

الشاشات دي نسخة من شاشات تطبيق TRIPS Staff، وبتاخد بياناتها من نفس الـ Endpoints (`/api/staff/analytics/*`)، وكلها موجودة على `web-api.trips.eg`. الكود في `src/app/demo/pages/staff-analytics/`.

| الشاشة | المسار | في التطبيق |
|---|---|---|
| الرئيسية (أدمن) | `/default`، فوق الإحصائيات القديمة | `admin_home_screen.dart` |
| الرئيسية (مورد) | `/default` | `vendor_home_screen.dart` |
| التحليلات | `/analytics/overview` | `AnalyticsScreen`، وللمورد `VendorAnalyticsScreen` |
| البحث والمبيعات (أدمن بس) | `/analytics/sales` | `SearchSalesScreen` |
| الطلبات الخاصة (أدمن بس) | `/analytics/custom-trips` | `CustomTripsAnalyticsScreen` |
| التقارير | `/analytics/reports` | `ReportsScreen` |

- **الأذونات:** القايمة بتظهر لأي حد عنده `Permissions.Booking.View`، وده نفس الإذن اللي السيرفر بيطلبه. السيرفر بيقصر بيانات المورد على شركته بس.
- **فترة الإحصائيات:** الفترة اللي تختارها (آخر 28 يوم، آخر 7 أيام، الشهر ده، آخر 3 شهور) بتفضل هي هي وانت بتتنقل بين شاشات التحليلات.
- **المكونات** (`staff-ui.ts`): `ts-kpi` و`ts-range-bar` و`ts-trend-chart` و`ts-bars` و`ts-share-bar` و`ts-sparkline` و`ts-progress`، والـ Pipe اسمه `tsNum`. ستايلها في `src/scss/trips-staff/_staff-widgets.scss`.
- **النصوص:** تحت `STAFF_UI` في `ar.json` و`en.json`، ومنقولة من ملفات الـ ARB بتاعة التطبيق.
