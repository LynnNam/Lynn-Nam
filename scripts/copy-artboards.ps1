# Copy artboard PNGs from Cursor assets into images/画板 N.png
$assets = Join-Path $PSScriptRoot "..\..\..\.cursor\projects\d-Lynn\assets"
if (-not (Test-Path $assets)) {
  $assets = "C:\Users\Administrator\.cursor\projects\d-Lynn\assets"
}
$dest = Join-Path $PSScriptRoot "..\images"
New-Item -ItemType Directory -Path $dest -Force | Out-Null

Get-ChildItem $assets -Filter "*.png" -ErrorAction SilentlyContinue | ForEach-Object {
  if ($_.Name -match '____(\d+)-') {
    $num = $Matches[1]
    Copy-Item $_.FullName -Destination (Join-Path $dest "画板 $num.png") -Force
    Write-Host "画板 $num.png"
  }
}
