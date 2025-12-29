# ============================================
# Premium GOLD Category Icon Generator (SAFE)
# ============================================

New-Item -ItemType Directory -Force -Path "./app/assets/categories" | Out-Null

$icons = @{
    "geography"   = "G"
    "science"     = "S"
    "history"     = "H"
    "movies"      = "M"
    "music"       = "Mu"
    "literature"  = "L"
    "sports"      = "Sp"
    "general"     = "GK"
    "popculture"  = "P"
    "logic"       = "Lo"
}

Write-Host "Generating GOLD icons..."

foreach ($name in $icons.Keys) {

    $letter = $icons[$name]
    $out = "./app/assets/categories/$name.png"

    magick convert `
        -size 1024x1024 gradient:"#FBE7A1-#D8B24A" `
        -gravity center `
        -fill black `
        -font Arial-Bold `
        -pointsize 280 `
        -annotate +0+40 "$letter" `
        $out

    Write-Host "Created: $out"
}

Write-Host "DONE."
