@echo off
setlocal
set "PROJECT=c:\Users\raavi\OneDrive\Desktop\AI-POWERED-LECTURE-VOICE-TO-TEXT-GENERATOR\AI-Powered-Lecture-Voice-to-Notes-Generator\AI-Powered-Lecture-Voice-to-Notes-Generator-main\AI-Powered Lecture Voice-to-Notes Generator\project"
subst X: "%PROJECT%" >nul 2>&1
X:
call npm install
if errorlevel 1 exit /b %errorlevel%
call npm run build
