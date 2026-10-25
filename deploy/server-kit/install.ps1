<#
  Устанавливает или обновляет сайт на сервере. Запускать двойным щелчком по install.cmd.
  Повторный запуск = обновление: программа заменяется, а настройки (config), база (data),
  сертификаты (certs) и журналы (logs) остаются как были.
#>
param([string]$InstallDir = "C:\infratech")

$ErrorActionPreference = "Stop"
$Src = $PSScriptRoot

$identity = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $identity.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -InstallDir `"$InstallDir`""
  exit
}

function Write-Step([string]$Text) {
  Write-Host ""
  Write-Host "==> $Text" -ForegroundColor Cyan
}

function Copy-Mirror([string]$From, [string]$To) {
  & robocopy $From $To /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "Не удалось скопировать $From -> $To (robocopy $LASTEXITCODE)" }
  $global:LASTEXITCODE = 0
}

# Файлы настроек пишем без BOM: и dotenv, и Caddy ждут чистый UTF-8.
function Write-Utf8([string]$Path, [string]$Text) {
  [IO.File]::WriteAllText($Path, $Text, (New-Object Text.UTF8Encoding $false))
}

function Expand-Template([string]$Template, [string]$Target) {
  $text = [IO.File]::ReadAllText($Template).Replace("__INSTALL_DIR__", $InstallDir.Replace("\", "/"))
  Write-Utf8 $Target $text
}

# Настройки создаются только при первой установке, чтобы обновление не затёрло правки.
function New-FromTemplate([string]$Template, [string]$Target) {
  if (Test-Path $Target) { return $false }
  Expand-Template $Template $Target
  return $true
}

function Wait-Http([string]$Url, [int]$Seconds = 40) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    try {
      Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 | Out-Null
      return $true
    } catch {
      Start-Sleep -Seconds 2
    }
  }
  return $false
}

function Escape-Xml([string]$Text) { return [Security.SecurityElement]::Escape($Text) }

try {
  if (-not (Test-Path "$Src\app\node\node.exe")) {
    throw "Рядом с install.ps1 нет папки app. Запускайте install.cmd из распакованного архива."
  }
  if ((Resolve-Path $Src).Path.TrimEnd("\") -ieq $InstallDir.TrimEnd("\")) {
    throw "Архив распакован прямо в $InstallDir. Переименуйте эту папку (например, в $InstallDir-setup) и запустите install.cmd из неё."
  }

  $node = "$InstallDir\app\node\node.exe"
  $services = @(
    @{
      Id = "InfratechApi"; Name = "Infratech API"; Description = "Backend сайта: формы обратной связи"
      Exe = $node; Arguments = "dist\app\main.js"; WorkDir = "$InstallDir\app\server"
      Env = @{ NODE_ENV = "production"; ENV_FILE = "$InstallDir\config\server.env" }
      Check = "http://127.0.0.1:4000/health"
    },
    @{
      Id = "InfratechWeb"; Name = "Infratech Web"; Description = "Frontend сайта (Next.js)"
      Exe = $node; Arguments = "server.js"; WorkDir = "$InstallDir\app\client"
      Env = @{ NODE_ENV = "production"; PORT = "3000"; HOSTNAME = "127.0.0.1"; API_INTERNAL_URL = "http://127.0.0.1:4000"; NEXT_TELEMETRY_DISABLED = "1" }
      Check = "http://127.0.0.1:3000/"
    },
    @{
      Id = "InfratechProxy"; Name = "Infratech Proxy (Caddy)"; Description = "Принимает посетителей на портах 80/443"
      Exe = "$InstallDir\tools\caddy.exe"; Arguments = "run --config `"$InstallDir\config\Caddyfile`" --adapter caddyfile"
      WorkDir = "$InstallDir\config"
      Env = @{ XDG_DATA_HOME = "$InstallDir\caddy-data"; XDG_CONFIG_HOME = "$InstallDir\caddy-data" }
      Check = "http://127.0.0.1/"
    }
  )

  Write-Step "Останавливаю службы сайта (если уже установлены)"
  [array]::Reverse($services)
  foreach ($svc in $services) {
    if (Get-Service -Name $svc.Id -ErrorAction SilentlyContinue) { Stop-Service -Name $svc.Id -Force }
  }
  [array]::Reverse($services)

  Write-Step "Копирую программу в $InstallDir"
  foreach ($dir in "config", "data", "logs", "certs", "services", "caddy-data") {
    New-Item -ItemType Directory -Force -Path "$InstallDir\$dir" | Out-Null
  }
  Copy-Mirror "$Src\app" "$InstallDir\app"
  Copy-Mirror "$Src\tools" "$InstallDir\tools"
  foreach ($file in "export-requests.cmd", "export-requests.ps1", "ИНСТРУКЦИЯ.md", "version.txt") {
    if (Test-Path "$Src\$file") { Copy-Item "$Src\$file" "$InstallDir\$file" -Force }
  }

  Write-Step "Настройки"
  if (New-FromTemplate "$Src\server.env.example" "$InstallDir\config\server.env") {
    Write-Host "Создан $InstallDir\config\server.env (почта пока выключена)"
  } else {
    Write-Host "Оставляю существующий $InstallDir\config\server.env"
  }
  if (New-FromTemplate "$Src\Caddyfile" "$InstallDir\config\Caddyfile") {
    Write-Host "Создан $InstallDir\config\Caddyfile (сайт по http)"
  } else {
    Write-Host "Оставляю существующий $InstallDir\config\Caddyfile"
  }
  Expand-Template "$Src\Caddyfile.https.example" "$InstallDir\config\Caddyfile.https.example"

  Write-Step "Регистрирую службы Windows"
  foreach ($svc in $services) {
    $envXml = ($svc.Env.GetEnumerator() | ForEach-Object {
      "  <env name=`"$($_.Key)`" value=`"$(Escape-Xml $_.Value)`" />"
    }) -join "`r`n"
    $xml = @"
<service>
  <id>$($svc.Id)</id>
  <name>$(Escape-Xml $svc.Name)</name>
  <description>$(Escape-Xml $svc.Description)</description>
  <executable>$(Escape-Xml $svc.Exe)</executable>
  <arguments>$(Escape-Xml $svc.Arguments)</arguments>
  <workingdirectory>$(Escape-Xml $svc.WorkDir)</workingdirectory>
$envXml
  <startmode>Automatic</startmode>
  <onfailure action="restart" delay="10 sec" />
  <stoptimeout>15 sec</stoptimeout>
  <logpath>$(Escape-Xml "$InstallDir\logs")</logpath>
  <log mode="roll-by-size">
    <sizeThreshold>10240</sizeThreshold>
    <keepFiles>5</keepFiles>
  </log>
</service>
"@
    Write-Utf8 "$InstallDir\services\$($svc.Id).xml" $xml
    Copy-Item "$InstallDir\tools\WinSW-x64.exe" "$InstallDir\services\$($svc.Id).exe" -Force
    if (-not (Get-Service -Name $svc.Id -ErrorAction SilentlyContinue)) {
      & "$InstallDir\services\$($svc.Id).exe" install | Out-Null
      if ($LASTEXITCODE -ne 0) { throw "Не удалось зарегистрировать службу $($svc.Id)" }
      Write-Host "Служба $($svc.Name) зарегистрирована"
    }
  }

  Write-Step "Брандмауэр Windows: разрешаю входящие на порты 80 и 443"
  foreach ($port in 80, 443) {
    $rule = "Infratech TCP $port"
    if (-not (Get-NetFirewallRule -DisplayName $rule -ErrorAction SilentlyContinue)) {
      New-NetFirewallRule -DisplayName $rule -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow | Out-Null
      Write-Host "Добавлено правило $rule"
    }
  }

  $busy = Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($busy) {
    $owner = (Get-Process -Id $busy.OwningProcess -ErrorAction SilentlyContinue).ProcessName
    Write-Host "ВНИМАНИЕ: порт 80 уже занят программой '$owner' (PID $($busy.OwningProcess))." -ForegroundColor Yellow
    Write-Host "Если это IIS (процесс System), остановите его: раздел 'Частые проблемы' в инструкции." -ForegroundColor Yellow
  }

  Write-Step "Запускаю службы и проверяю, что они отвечают"
  $failed = @()
  foreach ($svc in $services) {
    Start-Service -Name $svc.Id
    if (Wait-Http $svc.Check) {
      Write-Host "[OK]     $($svc.Name)" -ForegroundColor Green
    } else {
      Write-Host "[ОШИБКА] $($svc.Name) не отвечает на $($svc.Check)" -ForegroundColor Red
      $failed += $svc
    }
  }

  Write-Host ""
  if ($failed.Count -eq 0) {
    Write-Host "Сайт установлен и работает." -ForegroundColor Green
    Write-Host "Проверьте в браузере на сервере: http://127.0.0.1"
    Write-Host "И с телефона или своего компьютера: http://infratech.tj"
  } else {
    Write-Host "Не всё запустилось. Журналы служб — в папке $InstallDir\logs" -ForegroundColor Red
    foreach ($svc in $failed) { Write-Host "  $InstallDir\logs\$($svc.Id).err.log и $($svc.Id).out.log" }
  }
} catch {
  Write-Host ""
  Write-Host "ОШИБКА: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Нажмите Enter, чтобы закрыть окно"
