<#
  Выгружает все заявки с сайта в таблицу для Excel на рабочий стол.
  Запускать двойным щелчком по export-requests.cmd в папке C:\infratech.
#>
$ErrorActionPreference = "Stop"
$InstallDir = $PSScriptRoot

try {
  $desktop = [Environment]::GetFolderPath("Desktop")
  $target = Join-Path $desktop ("Заявки с сайта " + (Get-Date -Format "yyyy-MM-dd HH-mm") + ".csv")
  $env:ENV_FILE = "$InstallDir\config\server.env"
  $env:NODE_ENV = "production"
  & "$InstallDir\app\node\node.exe" "$InstallDir\app\server\dist\app\export-requests.js" $target
  if ($LASTEXITCODE -ne 0) { throw "Выгрузка завершилась с ошибкой" }
} catch {
  Write-Host "ОШИБКА: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Нажмите Enter, чтобы закрыть окно"
