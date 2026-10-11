@echo off
chcp 65001 >nul
title استديو الفن 3 - نظام إدارة الاستديو والإنتاج

cd /d "%~dp0\..\bin-win-x64"

if not exist "StudioManagement.WPF.exe" (
    echo [تنبيه] لم يتم العثور على الملف التنفيذي في مجلد bin-win-x64.
    echo جارٍ فحص المجلد الرئيسي...
    cd /d "%~dp0\.."
    if not exist "StudioManagement.WPF.exe" (
        echo يرجى تشغيل Publish-SelfContained-WinX64.bat أولاً لإنشاء النسخة التنفيذية.
        pause
        exit /b 1
    )
)

:: إنشاء مجلدات السجلات والنسخ الاحتياطي تلقائياً
if not exist "Logs" mkdir "Logs"
if not exist "Backups" mkdir "Backups"

echo جارٍ تشغيل نظام استديو الفن 3 بنمط التشغيل المحلي المستمر (24/7 Offline)...
start "" "StudioManagement.WPF.exe"
exit /b 0
