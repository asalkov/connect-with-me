# Fast compression script for Lambda deployment
# Usage: .\fast-zip.ps1 <output-file> <files...>

param(
    [Parameter(Mandatory=$true)]
    [string]$OutputFile,
    
    [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
    [string[]]$Files
)

# Remove existing file
if (Test-Path $OutputFile) {
    Remove-Item $OutputFile -Force
}

# Use 7-Zip if available (10-50x faster), otherwise use tar (5-10x faster than Compress-Archive)
$7zipPath = "C:\Program Files\7-Zip\7z.exe"
if (Test-Path $7zipPath) {
    Write-Host "Using 7-Zip for fast compression..." -ForegroundColor Yellow
    & $7zipPath a -tzip -mx1 $OutputFile $Files | Out-Null
} elseif (Get-Command tar -ErrorAction SilentlyContinue) {
    Write-Host "Using tar for fast compression..." -ForegroundColor Yellow
    tar -czf $OutputFile $Files
} else {
    Write-Host "Using Compress-Archive (slow)..." -ForegroundColor Yellow
    Compress-Archive -Path $Files -DestinationPath $OutputFile -Force
}

if (Test-Path $OutputFile) {
    $zipSize = (Get-Item $OutputFile).Length / 1MB
    Write-Host "Package created: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "Failed to create $OutputFile" -ForegroundColor Red
    exit 1
}
