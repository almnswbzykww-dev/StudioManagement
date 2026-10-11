# دليل تثبيت ونشر برنامج StudioManagement

1. متطلبات التشغيل:
   - Windows 10 أو Windows 11 (64-bit)
   - .NET 8.0 Desktop Runtime أو .NET 9.0
   - Microsoft SQL Server Express (محلي أو شبكي LAN)

2. أمر البناء والنشر النهائي:
   ```bash
   dotnet publish StudioManagement.WPF/StudioManagement.WPF.csproj -c Release -r win-x64 --self-contained false -o installer/publish
   ```

3. تجميع برنامج التثبيت (Inno Setup):
   افتح ملف `installer/StudioSetup.iss` في Inno Setup Compiler واضغط Run لإنشاء `StudioManagement-Setup.exe`.
