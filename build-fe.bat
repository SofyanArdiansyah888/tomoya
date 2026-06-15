@echo off
setlocal

set "ROOT=%~dp0"
node "%ROOT%scripts\build-fe.mjs"

if errorlevel 1 exit /b 1
