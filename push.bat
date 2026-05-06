@echo off
REM =====================================================
REM IDLE Game Project - Windows Git Push Script
REM Run in Windows CMD, uses local gh CLI
REM =====================================================

echo ============================================
echo   IDLE Project Git Push Script
echo ============================================
echo.

cd /d D:\Work\IDLE
if errorlevel 1 (
    echo [ERROR] Cannot switch to D:\Work\IDLE
    pause
    exit /b 1
)

echo [1/5] Checking git status...
git status --short
if %errorlevel% neq 0 (
    echo [ERROR] git status failed
    pause
    exit /b 1
)
echo.

git status --short | findstr /r "." >nul
if %errorlevel% neq 0 (
    echo [INFO] No changes to commit
    echo.
    goto :check_remote
)

echo [2/5] Adding all changes...
git add -A
if %errorlevel% neq 0 (
    echo [ERROR] git add failed
    pause
    exit /b 1
)
echo Done
echo.

echo [3/5] Committing changes...
if "%~1"=="" (
    set "COMMIT_MSG=update: game balance and card sets"
) else (
    set "COMMIT_MSG=%~1"
)
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo [ERROR] git commit failed
    pause
    exit /b 1
)
echo Commit: %COMMIT_MSG%
echo.

:check_remote
echo [4/5] Checking remote connection...
git fetch origin
if %errorlevel% neq 0 (
    echo [WARN] fetch failed, trying push anyway...
)
echo.

echo [5/5] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] git push failed
    echo Possible reasons:
    echo   - Network issue
    echo   - Auth issue (run: gh auth status)
    echo   - Remote conflict (run: git pull first)
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Push Successful!
echo ============================================
echo.

echo [Extra] Checking GitHub Actions status...
gh run list --limit 3
if %errorlevel% neq 0 (
    echo [INFO] gh CLI not available, skipping Actions check
)

echo.
pause
