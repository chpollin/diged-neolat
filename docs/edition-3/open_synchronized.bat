@echo off
echo Opening Lucina Synchronized Edition...
echo.
echo This edition features:
echo - Side-by-side text and manuscript view
echo - Automatic scroll synchronization
echo - Page markers showing manuscript breaks
echo.
start "" "web\index_sync.html"
echo.
echo Also opening image path test...
start "" "web\test_images.html"
echo.
echo If the pages don't open, navigate to:
echo %cd%\web\index_sync.html
echo %cd%\web\test_images.html
pause