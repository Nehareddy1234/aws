#!/usr/bin/env pwsh
# setup-claude.ps1 - Quick setup script for Claude Haiku integration
# Usage: .\setup-claude.ps1

Write-Host "🚀 AWS Photo Gallery - Claude Haiku 4.5 Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "✓ Checking prerequisites..." -ForegroundColor Yellow

$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

$awsVersion = aws --version 2>$null
if (-not $awsVersion) {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI" -ForegroundColor Red
    exit 1
}
Write-Host "  AWS CLI: $awsVersion" -ForegroundColor Green

# Step 2: Install dependencies
Write-Host ""
Write-Host "✓ Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps 2>&1 | Select-Object -Last 5

# Step 3: Build the project
Write-Host ""
Write-Host "✓ Building project..." -ForegroundColor Yellow
npm run build 2>&1 | Select-Object -Last 5

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 4: Display setup instructions
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Store Anthropic API key in Secrets Manager:"
Write-Host "   aws secretsmanager create-secret --name anthropic/api-key --secret-string 'sk-ant-YOUR_KEY' --region ap-south-1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Review deployment guide:"
Write-Host "   Read DEPLOYMENT_GUIDE.md for Lambda and API Gateway setup" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configure environment variables:"
Write-Host "   Copy .env.example to .env.local and update REACT_APP_CLAUDE_API_URL" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start local development:"
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Deploy to AWS Amplify:"
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Setup complete! Follow the steps above to deploy." -ForegroundColor Green
