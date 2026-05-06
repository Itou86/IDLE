@echo off
chcp 65001 >nul
REM =====================================================
REM IDLE 游戏项目 - Windows Git 推送脚本
REM 在 Windows CMD/PowerShell 中运行，利用本地 gh CLI
REM =====================================================

echo ============================================
echo   IDLE 项目 Git 推送脚本
echo ============================================
echo.

REM 切换到项目目录（Windows 路径）
cd /d D:\Work\IDLE
if errorlevel 1 (
    echo [错误] 无法切换到 D:\Work\IDLE
    pause
    exit /b 1
)

echo [1/5] 检查 Git 状态...
git status --short
if %errorlevel% neq 0 (
    echo [错误] git status 失败
    pause
    exit /b 1
)
echo.

REM 检查是否有未跟踪文件或修改
git status --short | findstr /r "." >nul
if %errorlevel% neq 0 (
    echo [提示] 没有需要提交的更改
    echo.
    goto :check_remote
)

echo [2/5] 添加所有更改...
git add -A
if %errorlevel% neq 0 (
    echo [错误] git add 失败
    pause
    exit /b 1
)
echo 完成
echo.

echo [3/5] 提交更改...
REM 使用默认提交信息，或从参数获取
if "%~1"=="" (
    set "COMMIT_MSG=update: 数值调整与卡组系统"
) else (
    set "COMMIT_MSG=%~1"
)
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo [错误] git commit 失败
    pause
    exit /b 1
)
echo 提交信息: %COMMIT_MSG%
echo.

:check_remote
echo [4/5] 检查远程连接...
git fetch origin
if %errorlevel% neq 0 (
    echo [警告] fetch 失败，尝试继续推送...
)
echo.

echo [5/5] 推送到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [错误] git push 失败
    echo 可能原因：
    echo   - 网络问题
    echo   - 权限问题（尝试 gh auth status）
    echo   - 远程有冲突（先执行 git pull）
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   推送成功！
echo ============================================
echo.

REM 可选：检查 GitHub Actions 状态
echo [额外] 检查 GitHub Actions 状态...
gh run list --limit 3
if %errorlevel% neq 0 (
    echo [提示] gh CLI 不可用，跳过 Actions 检查
)

echo.
pause
