Add-Type -AssemblyName System.Drawing

function Clamp([int]$v) {
    if ($v -lt 0) { return 0 }
    if ($v -gt 255) { return 255 }
    return $v
}

function Restore-CreamBackground {
    param([string]$Path, [int]$BgR = 247, [int]$BgG = 245, [int]$BgB = 239)
    if (-not (Test-Path $Path)) { return }

    $src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $Path))
    $w = $src.Width
    $h = $src.Height
    $out = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $src.GetPixel($x, $y)
            $a = $c.A / 255.0
            $r = Clamp ([int]($c.R * $a + $BgR * (1 - $a)))
            $g = Clamp ([int]($c.G * $a + $BgG * (1 - $a)))
            $b = Clamp ([int]($c.B * $a + $BgB * (1 - $a)))
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
        }
    }

    $src.Dispose()
    $out.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $out.Dispose()
    Write-Host "restored $Path"
}

$root = Join-Path $PSScriptRoot "..\images"
Restore-CreamBackground (Join-Path $root "lynn-hero-portrait.png")
Restore-CreamBackground (Join-Path $root "lynn-hero.png")
