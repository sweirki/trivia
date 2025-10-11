# === Mega-Wow-Trivia Full Phase-2 Diagnostic ===
cd C:\mega-wow-trivia

Write-Host "`n=== CHECKING FOLDER STRUCTURE ===`n"
$folders = @("app","src","assets","assets\audio","assets\images")
foreach ($f in $folders) {
  if (Test-Path $f) {Write-Host "✅ $f found"} else {Write-Host "❌ $f missing"}
}

Write-Host "`n=== CHECKING KEY FILES ===`n"
$files = @(
  "app\_layout.tsx",
  "app\index.tsx",
  "app\trivia.tsx",
  "src\lib\theme.ts",
  "src\engine\session.ts",
  "src\data\sampleQuestions.json"
)
foreach ($f in $files) {
  if (Test-Path $f) {Write-Host "✅ $f exists"} else {Write-Host "❌ $f missing"}
}

Write-Host "`n=== CHECKING ASSETS ===`n"
$assets = @(
  "assets\images\question-card-bg.png",
  "assets\images\timer-ring.png",
  "assets\images\scoreboard-bg.png",
  "assets\images\results-bg.png",
  "assets\audio\correct.mp3",
  "assets\audio\error.mp3",
  "assets\audio\win.mp3",
  "assets\audio\tick.mp3",
  "assets\audio\streak.mp3",
  "assets\audio\round-end.mp3"
)
foreach ($a in $assets) {
  if (Test-Path $a) {Write-Host "✅ $a OK"} else {Write-Host "❌ $a missing"}
}

Write-Host "`n=== CHECKING DEPENDENCIES ===`n"
npm ls expo-av expo-router react-native-safe-area-context react-native-screens | 
  Select-String "expo-av|expo-router|safe-area-context|screens"

Write-Host "`n=== CHECKING JSON PARSE ===`n"
try {
  $json = Get-Content src\data\sampleQuestions.json -Raw | ConvertFrom-Json
  if ($null -ne $json -and $json.Count -gt 0) {
    Write-Host "✅ sampleQuestions.json parsed successfully ($($json.Count) questions)"
  } else {
    Write-Host "❌ sampleQuestions.json is empty"
  }
} catch {
  Write-Host "❌ sampleQuestions.json has invalid JSON!"
}

Write-Host "`n=== CHECKING trivia.tsx EXPORT ===`n"
if (Select-String -Quiet -Path app\trivia.tsx -Pattern "export default") {
  Write-Host "✅ trivia.tsx has a default export"
} else {
  Write-Host "❌ trivia.tsx missing export default"
}

Write-Host "`n=== DONE ===`n"
