$env:ANDROID_HOME = "C:\Users\admin\AppData\Local\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:PATH"

Write-Host "✅ Android Environment Configured for this session." -ForegroundColor Green
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "PATH updated to include emulator and platform-tools."

Write-Host "`n🔍 Checking Emulators..."
$avds = emulator -list-avds
if ($avds) {
    Write-Host "Found Emulator: $avds" -ForegroundColor Green
} else {
    Write-Host "❌ No Emulators found! Please create one in Android Studio." -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Launching Emulator and Building App..."
# Try to launch emulator explicitly if not running, though run-android usually does this.
# We will just let run-android handle it now that PATH is fixed.

npx react-native run-android
