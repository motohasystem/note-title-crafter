@echo off
echo Building NoteTitleMaker...
dotnet build NoteTitleMaker\NoteTitleMaker.csproj -c Release
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)
echo Build completed successfully!
echo.
echo Executable location: NoteTitleMaker\bin\Release\net6.0-windows\NoteTitleMaker.exe
pause