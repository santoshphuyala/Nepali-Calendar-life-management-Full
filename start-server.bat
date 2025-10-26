@echo off
echo ========================================
echo   NEPALI CALENDAR PWA - Local Server
echo   Developer: Santosh Phuyal
echo ========================================
echo.
echo Starting local server on port 8000...
echo.
echo Open your browser to: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Try Python 3 first
python -m http.server 8000 2>nul

REM If Python 3 not found, try Python 2
if errorlevel 1 (
    echo Python 3 not found, trying Python 2...
    python -m SimpleHTTPServer 8000
)

REM If Python not found at all
if errorlevel 1 (
    echo.
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Or use another method to run a local server
    echo.
    pause
)