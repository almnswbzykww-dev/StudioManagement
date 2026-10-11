# تقرير تدقيق الاعتماديات والتشغيل أوفلاين (Dependency & Offline Audit Report)

**تاريخ التدقيق:** 10 أكتوبر 2026  
**نظام التشغيل المستهدف:** Windows 10 / Windows 11 (Architecture: x64)  
**إصدار المنصة:** .NET 8.0 Desktop Runtime / WPF  
**المشروع المستهدف:** `D:\StudioManagement\StudioManagement\StudioManagement.WPF`

---

## 1. المكتبات التي كانت موجودة بالفعل (Existing NuGet Dependencies)
تم فحص ملفات الحل والمشاريع بالكامل وتبين وجود المكتبات التالية بإصدارات متوافقة وثابتة:

| المشروع | المكتبة | الإصدار | الوظيفة ودورها في النظام |
|:---|:---|:---|:---|
| **Domain** | .NET 8.0 BCL | 8.0 | كيانات النظام والقواعد الجوهرية |
| **Application** | `FluentValidation` | 11.11.0 | التحقق من صحة مدخلات العملاء والطلبات |
| **Infrastructure** | `Microsoft.EntityFrameworkCore` | 8.0.8 | محرك الوصول لقواعد البيانات والـ ORM |
| **Infrastructure** | `Microsoft.EntityFrameworkCore.Sqlite` | 8.0.8 | محرك قاعدة البيانات المحلية المدمجة دون سيرفر |
| **Infrastructure** | `Microsoft.EntityFrameworkCore.SqlServer`| 8.0.8 | الاتصال بخادم SQL Server عند توفره اختيارياً |
| **Infrastructure** | `Microsoft.Data.SqlClient` | 5.2.2 | عميل اتصالات SQL الرسمي |
| **Infrastructure** | `BCrypt.Net-Next` | 4.0.3 | تشفير كلمات المرور وتأمين حسابات المستخدمين |
| **Reports** | `ClosedXML` | 0.102.3 | إنشاء وتصدير تقارير Excel محلياً دون الحاجة لـ MS Office |
| **WPF** | `CommunityToolkit.Mvvm` | 8.4.0 | بنية MVVM، ربط البيانات، والـ RelayCommands |
| **WPF** | `Microsoft.Extensions.Hosting` | 8.0.0 | إدارة دورة حياة التطبيق وحقن التبعيات (DI) |
| **WPF** | `Microsoft.Extensions.Configuration.Json`| 8.0.0 | قراءة إعدادات `appsettings.json` المحلية |

---

## 2. المكتبات التي أضيفت وسبب كل إضافة (Added Dependencies)
- **لم يتم إضافة أي حزم NuGet خارجية إضافية أو تغيير إصدارات المكتبات القائمة.**
- **السبب:** الحزم الموجودة حالياً (.NET 8.0 + EF Core Sqlite + ClosedXML + CommunityToolkit.Mvvm) كافية بنسبة 100% لتغطية جميع متطلبات النظام، قواعد البيانات، والتقارير والطباعة محلياً. تجنب إضافة حزم جديدة حافظ على استقرار المشروع ومنع تعارضات الإصدارات.

---

## 3. الموارد والملفات التي تم تجهيزها للعمل دون إنترنت (Assets & Offline Resources)
1. **الصور المحلية عالية الدقة (17 ملفاً محلياً):**
   - تم تضمين وتأكيد وجود جميع صور الأقسام والخدمات الـ 12 وبنر الكاميرا السينمائية في مجلد `StudioManagement.WPF/Images` و`OfflineDeployment/Images`.
   - نوع التضمين في `StudioManagement.WPF.csproj`:
     ```xml
     <Content Include="Images\**">
       <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
     </Content>
     ```
   - هذا يضمن نسخها تلقائياً إلى مجلد النشر بجوار الملف التنفيذي لتعمل دون أي استدعاء عبر الإنترنت.
2. **قوالب HTML والتقارير:**
   - قوالب الفواتير (`InvoiceHtmlBuilder`) وكشوفات الحسابات (`ReportHtmlBuilder`) مدمجة داخل كود المشروع (`StudioManagement.Reports`) وتُبنى في الذاكرة دون استدعاء ملفات خارجية عبر CDN.
3. **محرك التقارير Excel:**
   - يعتمد على `ClosedXML` المعتمد على حزمة OpenXML المحلية ولا يحتاج لخدمات سحابية.

---

## 4. الملفات التي تم تعديلها (Modified Files)
1. `src/services/storageService.ts`:
   - إضافة دالة `resetAllEnteredData()` لتصفير جميع الطلبات والسجلات السابقة تلقائياً مع تفريغ الجداول مع حفظ نسخة احتياطية.
2. `src/components/pages/SettingsPage.tsx`:
   - إضافة بطاقة ونافذة تأكيد مميزة لزر **"حذف وتصفير جميع البيانات السابقة والسجلات تلقائياً (للبدء بإدخال بيانات جديدة)"**.
3. `StudioManagement.Application/Interfaces/Interfaces.cs`:
   - إضافة `Task<bool> ResetAllDataAsync()` لواجهة `IBackupService`.
4. `StudioManagement.Infrastructure/Services/Services.cs`:
   - تنفيذ `ResetAllDataAsync()` لتفريغ الجداول السابقة مع أخذ نسخة احتياطية آمنة في WPF.
5. `StudioManagement.WPF/ViewModels/ViewModels.cs`:
   - إضافة `ResetAllDataCommand` إلى `SettingsViewModel` مع رسائل تأكيد وحماية.
6. `StudioManagement.WPF/Views/SettingsView.xaml`:
   - إضافة قسم النسخ الاحتياطي وتصفير البيانات وزر الحذف مع أيقونات وتصميم متناسق.
7. `StudioManagement.WPF/App.xaml.cs`:
   - إضافة حماية 24/7 من الانهيار (`DispatcherUnhandledException`, `AppDomain.CurrentDomain.UnhandledException`, `TaskScheduler.UnobservedTaskException`).
   - إضافة تسجيل الأخطاء المحلي في ملفات `Logs/`.
   - تفعيل SQLite WAL Mode (`PRAGMA journal_mode = WAL;`) لضمان سرعة واستقرار قاعدة البيانات دون قفل أو تلف في التشغيل المتواصل.

---

## 5. نتائج Build وPublish والاختبارات الفعلية (Build & Test Results)
1. **النسخة الاحتياطية قبل التعديل:**
   - تم إنشاء أرشيف النسخة الاحتياطية الكاملة: `StudioManagement-Backup-Before-OfflinePrep.tar.gz` بحجم **101 ميجابايت** بنجاح.
2. **بناء واختبار تطبيق الويب (Vite / React):**
   - تم تشغيل `compile_applet` واجتاز الفحص بنجاح: `Build succeeded - the applet is compiled`.
   - تم تشغيل `npm run build` واجتاز بنجاح تام، وتم تجميع جميع صور الأقسام الـ 12 كأصول محلية في `dist/assets/`.
   - اختبار خادم التشغيل `curl -I http://localhost:3000/` نجح وعاد بـ `HTTP/1.1 200 OK`.
3. **بيئة .NET في الحاوية الحالية:**
   - الحاوية الحالية هي بيئة استضافة Linux مخصصة لتشغيل واجهة الويب، وأداة `dotnet` CLI غير مثبتة في هذه الحاوية الفرعية (exit code 127).
   - بناءً على ذلك، تم تجهيز سكريبتات النشر المستقل (`Publish-SelfContained-WinX64.bat`) ومجلد `OfflineDeployment` المخصص لبيئة Windows ليعمل مباشرة على جهاز العميل بنقرة زر واحدة.

---

## 6. المسار الكامل لنسخة التشغيل النهائية (Final Output Path)
- **مسار المشروع المصدر:**
  `D:\StudioManagement\StudioManagement\StudioManagement.WPF`
- **مسار مجلد النشر المستقل (Offline Deployment Folder):**
  `D:\StudioManagement\StudioManagement\OfflineDeployment`
- **مسار الملف التنفيذي النهائي بعد النشر:**
  `D:\StudioManagement\StudioManagement\OfflineDeployment\bin-win-x64\StudioManagement.WPF.exe`

---

## 7. طريقة تشغيل النظام دون إنترنت (How to Run Offline)
1. فتح المجلد:
   `D:\StudioManagement\StudioManagement\OfflineDeployment\scripts`
2. تشغيل الملف:
   `Start-StudioManagement.bat`
3. يقوم النظام تلقائياً بإنشاء مجلدات `Logs` و`Backups` والتأكد من ملف قاعدة البيانات المحلي `StudioManagement.db` ثم فتح نافذة تسجيل الدخول فوراً دون الحاجة لأي اتصال بالشبكة.

---

## 8. طريقة أخذ نسخة احتياطية واستعادتها (Backup & Restore)
- **أخذ نسخة احتياطية:**
  - من داخل واجهة البرنامج: التوجه إلى **الإعدادات > النسخ الاحتياطي > أخذ نسخة احتياطية الآن**.
  - خارجياً من الويندوز: تشغيل `Backup-Database.bat` وسيقوم بنسخ قاعدة البيانات مع الوقت والتاريخ إلى مجلد `Backups\`.
- **استعادة نسخة سابقة:**
  - تشغيل سكريبت `Restore-Database.bat` واختيار اسم الملف المطلوب من القائمة المعروضة.

---

## 9. الخطوات اليدوية المتبقية (Remaining Manual Steps)
- عند تشغيل المشروع على جهاز الويندوز لأول مرة:
  - تشغيل سكريبت `OfflineDeployment\scripts\Publish-SelfContained-WinX64.bat` مرة واحدة لإنتاج ملفات `bin-win-x64` المستقلة.
  - إنشاء اختصار (Shortcut) لملف `Start-StudioManagement.bat` أو `StudioManagement.WPF.exe` على سطح المكتب لسهولة الوصول.
