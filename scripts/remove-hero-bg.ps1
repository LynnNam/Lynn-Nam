Add-Type -AssemblyName System.Drawing

function Clamp([int]$v) {
    if ($v -lt 0) { return 0 }
    if ($v -gt 255) { return 255 }
    return $v
}

function Remove-LightBackground {
    param([string]$Path)
    if (-not (Test-Path $Path)) { Write-Host "skip $Path"; return }

    $src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $Path))
    $w = $src.Width
    $h = $src.Height
    $out = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $src.GetPixel($x, $y)
            $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
            $maxC = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
            $minC = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
            $sat = if ($maxC -eq 0) { 0 } else { ($maxC - $minC) / $maxC }

            $alpha = 255
            if ($lum -gt 235) { $alpha = 0 }
            elseif ($lum -gt 200) { $alpha = [int](($245 - $lum) / 45 * 255) }
            elseif ($lum -gt 175 -and $sat -lt 0.12) { $alpha = [int](($220 - $lum) / 45 * 200) }

            if ($alpha -lt 255 -and $lum -lt 120) {
                $alpha = [Math]::Max($alpha, [Math]::Min(255, [int](80 + $lum * 1.2)))
            }

            $alpha = Clamp $alpha
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        }
    }

    $src.Dispose()
    $out.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $out.Dispose()
    Write-Host "ok $Path ($w x $h)"
}

$root = Join-Path $PSScriptRoot "..\images"
Remove-LightBackground (Join-Path $root "lynn-hero-portrait.png")
Remove-LightBackground (Join-Path $root "lynn-hero.png")
