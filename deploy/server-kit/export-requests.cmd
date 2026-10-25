@echo off
rem Double-click to export all site requests to a CSV table on the desktop.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0export-requests.ps1"
