<#
  Собирает пакет для установки сайта на сервер БЕЗ доступа в интернет.
  Запускается на компьютере разработчика (Windows, нужен интернет):
      powershell -NoProfile -ExecutionPolicy Bypass -File deploy\build-package.ps1
  Результат: deploy\out\infratech-ГГГГММДД-ЧЧММ.zip — его переносят на сервер (docs\DEPLOY.md).

  В пакет входит всё для запуска: Node.js, собранные client и server с зависимостями,
  Caddy (прокси на 80/443) и WinSW (запуск программ службами Windows).
  Сборка идёт во временной копии проекта, ваши node_modules и .env не затрагиваются.
#>
param(
  [string]$NodeMajor = "22",
  [string]$CaddyVersion = "2.10.2",
  [string]$WinswVersion = "2.12.0",
  [string]$SiteUrl = "https://infratech.tj"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Root = Split-Path -Parent $PSScriptRoot
$Cache = Join-Path $PSScriptRoot ".cache"
$Work = Join-Path $PSScriptRoot ".build"
$Out = Join-Path $PSScriptRoot "out"
$Kit = Join-Path $PSScriptRoot "server-kit"

function Write-Step([string]$Text) {
  Write-Host ""
  Write-Host "==> $Text" -ForegroundColor Cyan
}

function Invoke-Native([string]$WorkDir, [string]$File, [string[]]$Arguments) {
  Push-Location $WorkDir
  try {
    & $File @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Команда завершилась с ошибкой ($LASTEXITCODE): $File $($Arguments -join ' ')" }
  } finally {
    Pop-Location
  }
}

function Copy-Tree([string]$From, [string]$To, [string[]]$Extra = @()) {
  # robocopy справляется с длинными путями node_modules, в отличие от Copy-Item в PowerShell 5.1.
  & robocopy $From $To /E /NFL /NDL /NJH /NJS /NP @Extra | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "Не удалось скопировать $From -> $To (robocopy $LASTEXITCODE)" }
  $global:LASTEXITCODE = 0
}

function Remove-Tree([string]$Path) {
  if (Test-Path $Path) { cmd /c rd /s /q "`"$Path`"" | Out-Null }
}

function Get-Cached([string]$Url, [string]$FileName) {
  $target = Join-Path $Cache $FileName
  if (-not (Test-Path $target)) {
    Write-Host "Скачиваю $Url"
    Invoke-WebRequest -Uri $Url -OutFile "$target.part" -UseBasicParsing
    Move-Item "$target.part" $target -Force
  }
  return $target
}

New-Item -ItemType Directory -Force -Path $Cache, $Out | Out-Null

Write-Step "Node.js $NodeMajor (та же версия будет работать на сервере)"
$releases = Invoke-RestMethod "https://nodejs.org/dist/index.json" -UseBasicParsing
# PowerShell 5.1 передаёт JSON-массив в конвейер одним объектом — разворачиваем его явно.
$nodeVersion = ($releases | ForEach-Object { $_ } |
  Where-Object { $_.version -like "v$NodeMajor.*" } | Select-Object -First 1).version
if (-not $nodeVersion) { throw "Не нашёл версию Node.js $NodeMajor на nodejs.org" }
$nodeName = "node-$nodeVersion-win-x64"
$NodeDir = Join-Path $Cache $nodeName
if (-not (Test-Path $NodeDir)) {
  $nodeZip = Get-Cached "https://nodejs.org/dist/$nodeVersion/$nodeName.zip" "$nodeName.zip"
  Invoke-Native $Cache "tar.exe" @("-xf", $nodeZip)
}
# Сборка идёт этой версией Node: better-sqlite3 скачивается под неё и иначе не запустится на сервере.
$env:Path = "$NodeDir;$env:Path"
Write-Host "Node.js $nodeVersion"

Write-Step "Caddy $CaddyVersion и WinSW $WinswVersion"
$caddyDir = Join-Path $Cache "caddy-$CaddyVersion"
if (-not (Test-Path (Join-Path $caddyDir "caddy.exe"))) {
  $caddyZip = Get-Cached "https://github.com/caddyserver/caddy/releases/download/v$CaddyVersion/caddy_${CaddyVersion}_windows_amd64.zip" "caddy-$CaddyVersion.zip"
  New-Item -ItemType Directory -Force -Path $caddyDir | Out-Null
  Invoke-Native $caddyDir "tar.exe" @("-xf", $caddyZip)
}
$winswExe = Get-Cached "https://github.com/winsw/winsw/releases/download/v$WinswVersion/WinSW-x64.exe" "WinSW-$WinswVersion-x64.exe"

Write-Step "Копирую проект во временную папку"
Remove-Tree $Work
Copy-Tree "$Root\client" "$Work\client" @("/XD", "node_modules", ".next", "/XF", ".env", ".env.local", ".env.*.local", "*.tsbuildinfo")
Copy-Tree "$Root\server" "$Work\server" @("/XD", "node_modules", "dist", "data", "/XF", ".env", ".env.local", "*.tsbuildinfo")

Write-Step "Собираю client (Next.js)"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NEXT_PUBLIC_SITE_URL = $SiteUrl
# Адрес API в браузере не задаём: запросы идут на тот же домен, их принимает Caddy.
Remove-Item Env:NEXT_PUBLIC_API_URL -ErrorAction SilentlyContinue
Invoke-Native "$Work\client" "npm.cmd" @("ci", "--no-audit", "--no-fund")
Invoke-Native "$Work\client" "npm.cmd" @("run", "build")

Write-Step "Собираю server (Fastify)"
Invoke-Native "$Work\server" "npm.cmd" @("ci", "--no-audit", "--no-fund")
Invoke-Native "$Work\server" "npm.cmd" @("run", "build")
Invoke-Native "$Work\server" "npm.cmd" @("prune", "--omit=dev", "--no-audit", "--no-fund")
Invoke-Native "$Work\server" "node.exe" @("-e", "new (require('better-sqlite3'))(':memory:').close()")

Write-Step "Собираю пакет"
$Pkg = Join-Path $Work "infratech-setup"
New-Item -ItemType Directory -Force -Path "$Pkg\app\node", "$Pkg\tools" | Out-Null
Copy-Item "$NodeDir\node.exe" "$Pkg\app\node\node.exe"
Copy-Tree "$Work\client\.next\standalone" "$Pkg\app\client"
Copy-Tree "$Work\client\.next\static" "$Pkg\app\client\.next\static"
if (Test-Path "$Work\client\public") { Copy-Tree "$Work\client\public" "$Pkg\app\client\public" }
Copy-Tree "$Work\server\dist" "$Pkg\app\server\dist"
Copy-Tree "$Work\server\node_modules" "$Pkg\app\server\node_modules"
Copy-Item "$Work\server\package.json" "$Pkg\app\server\package.json"
Copy-Item (Join-Path $caddyDir "caddy.exe") "$Pkg\tools\caddy.exe"
Copy-Item $winswExe "$Pkg\tools\WinSW-x64.exe"
Copy-Tree $Kit $Pkg
Copy-Item "$Root\docs\DEPLOY.md" "$Pkg\ИНСТРУКЦИЯ.md"

try { $commit = (git -C $Root rev-parse --short HEAD) } catch { $commit = "неизвестен" }
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
Set-Content -Path "$Pkg\version.txt" -Value "Сборка $stamp, коммит $commit, Node.js $nodeVersion" -Encoding UTF8

$zip = Join-Path $Out "infratech-$stamp.zip"
# tar из Windows 10+ пакует zip заметно быстрее Compress-Archive и не ломается на длинных путях.
Invoke-Native $Work "tar.exe" @("-a", "-c", "-f", $zip, "infratech-setup")
Remove-Tree $Work

$sizeMb = [math]::Round((Get-Item $zip).Length / 1MB)
Write-Host ""
Write-Host "Готово: $zip ($sizeMb МБ)" -ForegroundColor Green
Write-Host "Дальше — шаг 2 инструкции docs\DEPLOY.md: перенести архив на сервер."
