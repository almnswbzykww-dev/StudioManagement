[Setup]
AppName=StudioManagement
AppVersion=2.5.0
DefaultDirName={autopf}\StudioManagement
DefaultGroupName=StudioManagement
OutputDir=Output
OutputBaseFilename=StudioManagement-Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=..\StudioManagement.WPF\Assets\AppIcon.ico

[Files]
Source: "..\StudioManagement.WPF\bin\Release\net8.0-windows\publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\StudioManagement"; Filename: "{app}\StudioManagement.WPF.exe"
Name: "{autodesktop}\StudioManagement"; Filename: "{app}\StudioManagement.WPF.exe"
