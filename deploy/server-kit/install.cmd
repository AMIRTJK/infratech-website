@echo off
rem Double-click to install or update the site. The script asks for administrator rights itself.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
