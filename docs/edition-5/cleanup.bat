@echo off
echo ========================================
echo  Edition-5 Cleanup Script
echo ========================================
echo.

REM Create new directory structure
echo Creating organized directory structure...
cd web

REM Create directories if they don't exist
if not exist "js" mkdir js
if not exist "tests" mkdir tests
if not exist "..\docs" mkdir ..\docs
if not exist "..\archive" mkdir ..\archive
if not exist "server" mkdir server

echo.
echo Moving JavaScript modules to js/ directory...
REM Move JS modules (check if files exist first)
if exist "prosopography.js" move prosopography.js js\ >nul 2>&1
if exist "metrics.js" move metrics.js js\ >nul 2>&1
if exist "commentary.js" move commentary.js js\ >nul 2>&1
if exist "translation.js" move translation.js js\ >nul 2>&1
if exist "export.js" move export.js js\ >nul 2>&1
if exist "edit-mode.js" move edit-mode.js js\ >nul 2>&1
if exist "init-master.js" move init-master.js js\ >nul 2>&1

echo Moving test files to tests/ directory...
REM Move test files
if exist "test-*.html" move test-*.html tests\ >nul 2>&1
if exist "test-*.js" move test-*.js tests\ >nul 2>&1
if exist "final-test.html" move final-test.html tests\ >nul 2>&1
if exist "quick-test.js" move quick-test.js tests\ >nul 2>&1
if exist "debug-tei.js" move debug-tei.js tests\ >nul 2>&1

echo Moving server files to server/ directory...
REM Move server files
if exist "edit-server.js" move edit-server.js server\ >nul 2>&1
if exist "package.json" copy package.json server\ >nul 2>&1
if exist "package-lock.json" copy package-lock.json server\ >nul 2>&1
if exist "validate-tei.js" move validate-tei.js server\ >nul 2>&1

echo Moving documentation files...
REM Move documentation
if exist "EDIT_MODE_README.md" move EDIT_MODE_README.md ..\docs\ >nul 2>&1
if exist "..\IMPLEMENTATION_SUMMARY.md" move ..\IMPLEMENTATION_SUMMARY.md ..\docs\ >nul 2>&1
if exist "..\project.md" move ..\project.md ..\docs\ >nul 2>&1

echo Archiving backup and unused files...
REM Archive files
if exist "indices-backup.html" move indices-backup.html ..\archive\ >nul 2>&1
if exist "indices-edit-mode.js" move indices-edit-mode.js ..\archive\ >nul 2>&1
if exist "*.py" move *.py ..\archive\ >nul 2>&1
if exist "llm-extracted-data\*.py" move llm-extracted-data\*.py ..\archive\ >nul 2>&1

echo.
echo Cleanup recommendations:
echo 1. Remove node_modules/ directory (600+ MB)
echo    Command: rmdir /s /q node_modules
echo.
echo 2. Remove .claude/ directory
echo    Command: rmdir /s /q .claude
echo.
echo 3. To reinstall dependencies later:
echo    Command: cd server ^&^& npm install
echo.
echo ========================================
echo  Cleanup Complete!
echo ========================================
echo.
echo Final structure:
echo   web/
echo   ├── HTML files (index, about, etc.)
echo   ├── js/ (all JavaScript modules)
echo   ├── data/ (TEI and JSON data)
echo   ├── server/ (development server)
echo   ├── tests/ (all test files)
echo   └── output/ (for edited files)
echo.
pause