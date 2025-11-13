# AWS Photo Gallery with Claude Haiku 4.5 - Deployment Guide

## 🚀 Overview

Your app is now configured to use **Claude Haiku 4.5** for AI-powered photo search through a secure Lambda backend. This guide walks you through setup, deployment to AWS Amplify, and managing secrets safely.

## ⚠️ CRITICAL: Security First

### 1. Revoke Exposed AWS Credentials (DO THIS IMMEDIATELY)

Your AWS credentials were exposed in chat. Follow these steps now:

#### A. Revoke the leaked keys in AWS Console:
1. Sign in to AWS Console → **IAM → Users → [Your Username]**
2. Click **Security credentials** tab
3. Find the access key: `AKIA6OCOD7CIMZT7IJLN`
4. Click **Delete** → confirm

#### B. Create new credentials (using AWS CLI):
```powershell
# Configure AWS CLI with your new credentials
aws configure

# Enter when prompted:
# AWS Access Key ID: [new key from IAM console]
# AWS Secret Access Key: [new secret from IAM console]
# Default region: ap-south-1
# Default output format: json
```

#### C. Clean Git history to remove old keys:
```powershell
# Search for any hardcoded credentials
git log --all -p -S "AKIA6OCOD7CIMZT7IJLN" || git grep "AKIA6OCOD7CIMZT7IJLN"

# If found, use git filter-repo to remove:
pip install git-filter-repo
git filter-repo --replace-text <(echo "AKIA6OCOD7CIMZT7IJLN==" | base64)

# Force push cleaned history
git push --force
```

---

## 📋 Prerequisites

- [ ] New AWS credentials created and configured locally
- [ ] GitHub account with repo access
- [ ] Node.js 18+ installed
- [ ] Anthropic API key (get from https://console.anthropic.com)

---

## 🔑 Step 1: Store Anthropic API Key in AWS Secrets Manager

Store your Anthropic API key securely so the Lambda function can access it without exposing it.

```powershell
# Create secret in AWS Secrets Manager
aws secretsmanager create-secret `
  --name anthropic/api-key `
  --description "Anthropic API key for Claude Haiku 4.5" `
  --secret-string "sk-ant-YOUR_ACTUAL_ANTHROPIC_KEY_HERE" `
  --region ap-south-1
```

**Note:** Replace `sk-ant-YOUR_ACTUAL_ANTHROPIC_KEY_HERE` with your real Anthropic API key from https://console.anthropic.com/account/keys

---

## 🏗️ Step 2: Deploy Lambda Function

### A. Install dependencies for Lambda:
```powershell
cd lambda
npm install
```

### B. Create IAM role for Lambda with Secrets Manager access:
```powershell
# Create trust policy document
$trustPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Principal = @{ Service = "lambda.amazonaws.com" }
            Action = "sts:AssumeRole"
        }
    )
} | ConvertTo-Json

# Save to file
$trustPolicy | Out-File -Encoding UTF8 trust-policy.json

# Create role
aws iam create-role `
  --role-name claude-haiku-lambda-role `
  --assume-role-policy-document file://trust-policy.json

# Attach basic execution policy
aws iam attach-role-policy `
  --role-name claude-haiku-lambda-role `
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Create inline policy for Secrets Manager access
$secretsPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Action = @("secretsmanager:GetSecretValue")
            Resource = "arn:aws:secretsmanager:ap-south-1:*:secret:anthropic/api-key-*"
        }
    )
} | ConvertTo-Json

$secretsPolicy | Out-File -Encoding UTF8 secrets-policy.json

aws iam put-role-policy `
  --role-name claude-haiku-lambda-role `
  --policy-name claude-secrets-policy `
  --policy-document file://secrets-policy.json
```

### C. Deploy Lambda function:
```powershell
# Package lambda
Compress-Archive -Path "lambda/*" -DestinationPath lambda.zip -Force

# Deploy to Lambda
aws lambda create-function `
  --function-name claude-haiku-handler `
  --runtime nodejs18.x `
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/claude-haiku-lambda-role `
  --handler claude-haiku-handler.handler `
  --zip-file fileb://lambda.zip `
  --timeout 30 `
  --environment Variables="{ANTHROPIC_API_KEY_SECRET=anthropic/api-key}" `
  --region ap-south-1
```

**For updates:**
```powershell
Compress-Archive -Path "lambda/*" -DestinationPath lambda.zip -Force

aws lambda update-function-code `
  --function-name claude-haiku-handler `
  --zip-file fileb://lambda.zip `
  --region ap-south-1
```

---

## 🔌 Step 3: Create API Gateway Endpoint

```powershell
# Create REST API
$apiId = aws apigateway create-rest-api `
  --name "claude-haiku-api" `
  --description "API endpoint for Claude Haiku Lambda" `
  --region ap-south-1 `
  --query 'id' --output text

# Get root resource ID
$rootId = aws apigateway get-resources `
  --rest-api-id $apiId `
  --region ap-south-1 `
  --query 'items[0].id' --output text

# Create /claude resource
$resourceId = aws apigateway create-resource `
  --rest-api-id $apiId `
  --parent-id $rootId `
  --path-part claude `
  --region ap-south-1 `
  --query 'id' --output text

# Create POST method
aws apigateway put-method `
  --rest-api-id $apiId `
  --resource-id $resourceId `
  --http-method POST `
  --authorization-type NONE `
  --region ap-south-1

# Integrate with Lambda
aws apigateway put-integration `
  --rest-api-id $apiId `
  --resource-id $resourceId `
  --http-method POST `
  --type AWS_PROXY `
  --integration-http-method POST `
  --uri "arn:aws:apigateway:ap-south-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-south-1:$(aws sts get-caller-identity --query Account --output text):function:claude-haiku-handler/invocations" `
  --region ap-south-1

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission `
  --function-name claude-haiku-handler `
  --statement-id AllowAPIGatewayInvoke `
  --action lambda:InvokeFunction `
  --principal apigateway.amazonaws.com `
  --region ap-south-1

# Deploy API to prod stage
aws apigateway create-deployment `
  --rest-api-id $apiId `
  --stage-name prod `
  --region ap-south-1

# Get endpoint URL
$endpoint = "https://${apiId}.execute-api.ap-south-1.amazonaws.com/prod/claude"
Write-Output "API Endpoint: $endpoint"
```

**Save your endpoint URL** — you'll need it in the next step.

---

## 🌍 Step 4: Update Environment Variables

Create a `.env.local` file in your project root:

```bash
# .env.local
REACT_APP_CLAUDE_API_URL=https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod/claude
```

Replace `YOUR_API_ID` with the API ID from the endpoint URL above.

---

## 📦 Step 5: Build and Test Locally

```powershell
# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:3000` in your browser. Log in and try the AI search feature.

---

## 🚀 Step 6: Deploy to AWS Amplify Console

### A. Push code to GitHub:
```powershell
git add .
git commit -m "Add Claude Haiku 4.5 integration"
git push origin main
```

### B. Connect to Amplify Console:
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/home)
2. Click **"Create app"** → **"Host web app"**
3. Select **GitHub** → authorize and select your repository
4. Select branch: `main`
5. Accept build settings (Amplify auto-detects Create React App)
6. Click **"Create app"**

### C. Add environment variables in Amplify Console:
1. In Amplify Console, go to **"App settings"** → **"Environment variables"**
2. Add:
   - Key: `REACT_APP_CLAUDE_API_URL`
   - Value: `https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod/claude`

3. Save and redeploy

---

## ✅ Verification Checklist

- [ ] AWS credentials revoked and new ones configured locally
- [ ] Anthropic API key stored in AWS Secrets Manager
- [ ] Lambda function deployed and tested
- [ ] API Gateway endpoint created and accessible
- [ ] Environment variables set in `.env.local` and Amplify Console
- [ ] App builds successfully: `npm run build`
- [ ] Local development works: `npm start`
- [ ] Claude search works in the app (shows "🤖 Claude Haiku 4.5 Enabled")
- [ ] App deployed to Amplify Console with custom domain

---

## 🔧 Troubleshooting

### Lambda returning 403 Forbidden
- Check IAM role has `secretsmanager:GetSecretValue` permission
- Verify secret name matches in Lambda code: `anthropic/api-key`

### "Cannot read property 'text' of undefined" error
- Verify Anthropic API key is valid in Secrets Manager
- Check Anthropic API response format

### CORS errors when calling Lambda
- Lambda handler includes CORS headers (already configured)
- Verify API Gateway has OPTIONS method enabled

### Build fails locally
- Clear `node_modules`: `rm -r node_modules; npm install`
- Clear cache: `npm cache clean --force`

---

## 📊 Monitoring

View Lambda logs in CloudWatch:
```powershell
# View recent logs
aws logs tail /aws/lambda/claude-haiku-handler --follow --region ap-south-1
```

---

## 💰 Cost Estimates

- **AWS Lambda**: ~$0.20/1M requests (free tier: 1M/month)
- **API Gateway**: ~$0.35 per 1M requests (free tier: 1M/month)
- **Secrets Manager**: $0.40/secret/month
- **Anthropic Claude Haiku**: $0.80/$4 per 1M input/output tokens

---

## 🔐 Security Best Practices

✅ **Implemented:**
- API key stored in AWS Secrets Manager (not in code)
- Lambda runs with least privilege IAM role
- API Gateway provides CORS protection
- HTTPS endpoints only

✅ **Consider adding:**
- API Gateway API key/request authentication
- CloudFront CDN for static assets
- WAF (Web Application Firewall) on API Gateway
- Enable VPC for Lambda (if needed)

---

## 📞 Support

For issues:
1. Check Lambda CloudWatch logs
2. Verify IAM permissions
3. Confirm Anthropic API key validity
4. Check CORS headers in browser Network tab

---

**Status: ✅ Claude Haiku 4.5 Enabled for All Clients**
