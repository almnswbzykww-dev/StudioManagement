@echo off
chcp 65001 >nul
echo =======================================================================
echo    استعادة نسخة احتياطية لقاعدة بيانات الاستديو (Offline Restore)
echo =======================================================================
echo.

cd /d "%~dp0\..\bin-win-x64"

if not exist "Backups" (
    echo [خطأ] لم يتم العثور على مجلد Backups.
    pause
    exit /b 1
)

echo النسخ الاحتياطية المتوفرة:
echo -----------------------------------------------------------------------
dir /b "Backups\*.db" "Backups\*.bak" 2>nul
echo -----------------------------------------------------------------------
echo.
set /p BACKUP_NAME="أدخل اسم ملف النسخة الاحتياطية المراد استعادتها (مثال: StudioManagement_Backup_20261010.db): "

if not exist "Backups\%BACKUP_NAME%" (
    echo [خطأ] الملف المدخل غير موجود في مجلد Backups.
    pause
    exit /b 1
)

echo.
echo تحذير: استعادة النسخة الاحتياطية ستستبدل قاعدة البيانات الحالية!
set /p CONFIRM="هل ترغب بالتأكيد والمتابعة؟ (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo تم إلغاء العملية.
    pause
    exit /b 0
)

:: إغلاق أي عملية تعمل للبرنامج قبل الاستبدال
taskkill /f /im "StudioManagement.WPF.exe" 2>nul

:: أخذ نسخة أمان سريعة من الحالية
if exist "StudioManagement.db" (
    copy /y "StudioManagement.db" "Backups\PreRestore_Safety.db" >nul
)

copy /y "Backups\%BACKUP_NAME%" "StudioManagement.db" >nul

if %errorlevel% equ 0 (
    echo [تم بنجاح!] تم استعادة قاعدة البيانات بنجاح من %BACKUP_NAME%.
) else (
    echo [خطأ] فشلت عملية الاستعادة.
)

pause
