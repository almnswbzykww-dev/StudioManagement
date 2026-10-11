@echo off
chcp 65001 >nul
echo =======================================================================
echo    أخذ نسخة احتياطية فورية لقاعدة بيانات الاستديو (Offline Backup)
echo =======================================================================
echo.

cd /d "%~dp0\..\bin-win-x64"

if not exist "StudioManagement.db" (
    cd /d "%~dp0\.."
    if not exist "StudioManagement.db" (
        echo [خطأ] لم يتم العثور على ملف قاعدة البيانات StudioManagement.db.
        pause
        exit /b 1
    )
)

if not exist "Backups" mkdir "Backups"

:: استخراج التاريخ والوقت لتسمية الملف
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set TIMESTAMP=%dt:~0,8%_%dt:~8,6%
if "%TIMESTAMP%"=="" set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%random%

set BACKUP_FILE=Backups\StudioManagement_Backup_%TIMESTAMP%.db

echo جارٍ نسخ قاعدة البيانات إلى %BACKUP_FILE% ...
copy /y "StudioManagement.db" "%BACKUP_FILE%" >nul

if %errorlevel% equ 0 (
    echo [تم بنجاح!] تم إنشاء النسخة الاحتياطية بنجاح:
    echo %BACKUP_FILE%
) else (
    echo [خطأ] فشل نسخ قاعدة البيانات.
)

pause
