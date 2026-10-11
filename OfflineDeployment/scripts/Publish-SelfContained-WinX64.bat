@echo off
chcp 65001 >nul
echo =======================================================================
echo    نظام إدارة استديو التصوير والطباعة - StudioManagement
echo    بناء ونشر النسخة المستقلة أوفلاين (Self-Contained Publish win-x64)
echo =======================================================================
echo.

cd /d "%~dp0\..\.."

echo [1/3] فحص بيئة .NET SDK...
where dotnet >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطأ] لم يتم العثور على أداة dotnet في النظام. يرجى تثبيت .NET 8 SDK.
    pause
    exit /b 1
)

echo [2/3] نشر المشروع كنسخة مستقلة win-x64 (Self-Contained) تتضمن Runtime بالكامل...
dotnet publish "StudioManagement.WPF\StudioManagement.WPF.csproj" ^
    -c Release ^
    -r win-x64 ^
    --self-contained true ^
    -p:PublishSingleFile=false ^
    -p:IncludeNativeLibrariesForSelfExtract=true ^
    -o "OfflineDeployment\bin-win-x64"

if %errorlevel% neq 0 (
    echo [خطأ] فشلت عملية النشر. يرجى مراجعة رسائل الخطأ أعلاه.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] نسخ الموارد المحلية (الصور والإعدادات)...
if not exist "OfflineDeployment\bin-win-x64\Images" mkdir "OfflineDeployment\bin-win-x64\Images"
xcopy /y /e /i "StudioManagement.WPF\Images\*" "OfflineDeployment\bin-win-x64\Images\" >nul
copy /y "OfflineDeployment\config\appsettings.json" "OfflineDeployment\bin-win-x64\appsettings.json" >nul

echo.
echo =======================================================================
echo   [تم بنجاح!] تم تجهيز النسخة المستقلة بنجاح في:
echo   %cd%\OfflineDeployment\bin-win-x64
echo   النسخة الآن جاهزة للتشغيل أوفلاين بدون أي اتصال بالإنترنت!
echo =======================================================================
pause
