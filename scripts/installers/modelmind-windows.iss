#define PackageRoot GetEnv("MODELMIND_PACKAGE_ROOT")

[Setup]
AppId={{e26702c7-366f-4e65-bc53-4d48496aa57f}
AppName=ModelMind
AppVersion=0.1.0
AppPublisher=ModelMind
DefaultDirName={localappdata}\Programs\ModelMind
DefaultGroupName=ModelMind
OutputDir={#GetEnv("RUNNER_TEMP")}
OutputBaseFilename=ModelMind-Setup-{#GetEnv("MODELMIND_PACKAGE_SUFFIX")}
PrivilegesRequired=lowest
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
Uninstallable=yes
Compression=lzma2
SolidCompression=yes
WizardStyle=modern

[Files]
Source: "{#PackageRoot}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{userprograms}\ModelMind\Start ModelMind"; Filename: "{app}\scripts\start-beta-windows.cmd"
Name: "{userprograms}\ModelMind\Uninstall ModelMind"; Filename: "{uninstallexe}"

[Messages]
WelcomeLabel2=This installs the private ModelMind staging companion. It includes Node.js and Python runtimes. Jupyter packages are downloaded on first launch.
