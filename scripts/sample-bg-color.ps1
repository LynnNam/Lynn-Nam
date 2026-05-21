Add-Type -AssemblyName System.Drawing
$p = Join-Path $PSScriptRoot "..\images\lynn-hero-portrait.png"
$b = [System.Drawing.Bitmap]::FromFile((Resolve-Path $p).Path)
$w = [int]$b.Width
$h = [int]$b.Height
if ($w -lt 2 -or $h -lt 2) { throw "Invalid image dimensions: ${w}x${h}" }

function Sample-At($x, $y) {
  $c = $b.GetPixel([int]$x, [int]$y)
  return @([int]$c.R, [int]$c.G, [int]$c.B)
}

$samples = @(
  (Sample-At 0 0),
  (Sample-At 1 0),
  (Sample-At 0 1),
  (Sample-At ($w - 2) 0),
  (Sample-At 0 ($h - 2)),
  (Sample-At ($w - 2) ($h - 2)),
  (Sample-At 12 12),
  (Sample-At ($w - 13) 12),
  (Sample-At 12 ($h - 13)),
  (Sample-At ($w - 13) ($h - 13))
)

$b.Dispose()

$rs = $samples | ForEach-Object { $_[0] }
$gs = $samples | ForEach-Object { $_[1] }
$bs = $samples | ForEach-Object { $_[2] }

$r = [int][Math]::Round(($rs | Measure-Object -Average).Average)
$g = [int][Math]::Round(($gs | Measure-Object -Average).Average)
$bl = [int][Math]::Round(($bs | Measure-Object -Average).Average)
$hex = "#{0:x2}{1:x2}{2:x2}" -f $r, $g, $bl
Write-Output $hex
Write-Output "RGB $r $g $bl"
