@echo off
REM ===============================================================
REM SearxNG LinkedIn Collector - UI Launcher
REM ===============================================================
REM Double-click this file to launch the graphical interface

title SearxNG LinkedIn Collector - UI Launcher

echo.
echo ===============================================================
echo   SearxNG LinkedIn Collector - UI Launcher
echo ===============================================================
echo.
echo Starting graphical interface...
echo.

REM Check if PowerShell is available
where pwsh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using PowerShell Core...
    pwsh.exe -ExecutionPolicy Bypass -File "%~dp0SearxQueriesUI.ps1"
) else (
    echo Using Windows PowerShell...
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0SearxQueriesUI.ps1"
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===============================================================
    echo   ERROR: Failed to start UI
    echo ===============================================================
    echo.
    echo Possible solutions:
    echo   1. Run as Administrator
    echo   2. Enable PowerShell execution: 
    echo      Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    echo   3. Launch manually: .\SearxQueriesUI.ps1
    echo.
    pause
)

