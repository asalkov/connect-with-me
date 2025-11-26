# Redeploy Lambda Function

Write-Host "Redeploying Lambda function..." -ForegroundColor Green

# Build
Write-Host "`nBuilding backend..." -ForegroundColor Cyan
cd backend
cmd /c npm run build:lambda

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Package
Write-Host "`nPackaging..." -ForegroundColor Cyan
if (Test-Path "deploy.zip") {
    Remove-Item "deploy.zip" -Force -ErrorAction SilentlyContinue
}

# Use 7-Zip if available (10-50x faster), otherwise use tar (5-10x faster than Compress-Archive)
$7zipPath = "C:\Program Files\7-Zip\7z.exe"
if (Test-Path $7zipPath) {
    Write-Host "Using 7-Zip for fast compression..." -ForegroundColor Yellow
    & $7zipPath a -tzip -mx1 deploy.zip dist node_modules package.json | Out-Null
} elseif (Get-Command tar -ErrorAction SilentlyContinue) {
    Write-Host "Using tar for fast compression..." -ForegroundColor Yellow
    tar -czf deploy.zip dist node_modules package.json
} else {
    Write-Host "Using Compress-Archive (slow)..." -ForegroundColor Yellow
    Compress-Archive -Path dist/,node_modules/,package.json -DestinationPath deploy.zip -Force
}

$zipSize = (Get-Item "deploy.zip").Length / 1MB
Write-Host "Package size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Yellow

# Get S3 bucket
cd ../terraform-serverless
$bucketName = terraform output -raw s3_bucket_name

# Upload to S3
Write-Host "`nUploading to S3..." -ForegroundColor Cyan
cd ../backend
aws s3 cp deploy.zip s3://$bucketName/lambda/deploy.zip

# Deploy from S3
Write-Host "`nDeploying to Lambda..." -ForegroundColor Cyan
aws lambda update-function-code `
    --function-name prod-chat-api `
    --s3-bucket $bucketName `
    --s3-key lambda/deploy.zip

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS! Lambda function deployed" -ForegroundColor Green
    Write-Host "`nWait 10 seconds for Lambda to update..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Test
    cd ../terraform-serverless
    $apiUrl = terraform output -raw api_gateway_url
    Write-Host "`nTesting API..." -ForegroundColor Cyan
    Write-Host "API URL: $apiUrl" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl/health" -Method GET -ErrorAction Stop
        Write-Host "SUCCESS! API is working!" -ForegroundColor Green
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
    } catch {
        Write-Host "API test failed. Check logs:" -ForegroundColor Yellow
        Write-Host "aws logs tail /aws/lambda/prod-chat-api --follow" -ForegroundColor Gray
    }
    
    cd ..
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
    cd ..
    exit 1
}
