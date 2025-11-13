# 🎯 Quick Start - Claude Haiku 4.5 Photo Gallery

## ✅ What's Been Done

Your AWS Photo Gallery now has **Claude Haiku 4.5** AI-powered search fully integrated:

- ✅ Frontend components updated with Claude integration (`SearchPanel.js`, `App.js`)
- ✅ Secure Lambda handler created for Claude API calls (`lambda/claude-haiku-handler.js`)
- ✅ Frontend client utility for calling Lambda (`src/claudeClient.js`)
- ✅ Amplify build configuration (`amplify.yml`)
- ✅ GitHub Actions CI/CD workflow (`.github/workflows/deploy.yml`)
- ✅ Production build tested and verified ✓
- ✅ Comprehensive deployment guide (`DEPLOYMENT_GUIDE.md`)

**Status**: 🤖 Claude Haiku 4.5 enabled for all clients

---

## 🚀 Getting Started (3 Steps)

### Step 1: Prepare AWS (One-time setup)

```powershell
# 1. Revoke exposed credentials (if you haven't already)
# See DEPLOYMENT_GUIDE.md "CRITICAL: Security First" section

# 2. Create new AWS credentials
aws configure

# 3. Store Anthropic API key in Secrets Manager
aws secretsmanager create-secret `
  --name anthropic/api-key `
  --secret-string "sk-ant-YOUR_ANTHROPIC_KEY" `
  --region ap-south-1
```

Get your Anthropic API key from: https://console.anthropic.com/account/keys

### Step 2: Deploy Lambda & API Gateway

Follow the detailed steps in **DEPLOYMENT_GUIDE.md**:
- Deploy Lambda function
- Create API Gateway endpoint
- Save your endpoint URL

### Step 3: Deploy to AWS Amplify

```powershell
# 1. Set environment variable
cp .env.example .env.local
# Edit .env.local and add your API endpoint

# 2. Push to GitHub
git add .
git commit -m "Claude Haiku 4.5 integration"
git push origin main

# 3. Connect to Amplify Console
# Go to: https://console.aws.amazon.com/amplify/
# Click "Create app" → Connect your GitHub repo
```

---

## 📁 Key Files Added/Modified

| File | Purpose |
|------|---------|
| `src/claudeClient.js` | Frontend utility to call Claude Lambda |
| `src/SearchPanel.js` | Updated with Claude AI search integration |
| `src/App.js` | Shows "Claude Haiku 4.5 Enabled" badge |
| `lambda/claude-haiku-handler.js` | Lambda function that calls Anthropic API |
| `amplify.yml` | Build configuration for Amplify |
| `.github/workflows/deploy.yml` | Automated CI/CD on push to main |
| `.env.example` | Template for environment variables |
| `DEPLOYMENT_GUIDE.md` | Complete deployment instructions |
| `setup-claude.ps1` | Quick setup script for Windows |

---

## 🧪 Local Development

```powershell
# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:3000` and test the AI search feature.

**Note**: Local testing won't work until you update `REACT_APP_CLAUDE_API_URL` in `.env.local` with your Lambda endpoint.

---

## 🔐 Security Checklist

- [ ] AWS credentials revoked
- [ ] Anthropic API key stored in Secrets Manager (NOT in code)
- [ ] `.env.local` added to `.gitignore`
- [ ] Lambda has minimal IAM permissions
- [ ] API Gateway has CORS configured
- [ ] All endpoints use HTTPS

---

## 🛠️ Troubleshooting

**Lambda returns 403?**
- Check IAM role has `secretsmanager:GetSecretValue` permission
- Verify secret name: `anthropic/api-key`

**CORS error?**
- Lambda includes CORS headers (already configured)
- Check browser Network tab for actual error

**Build fails?**
```powershell
rm -r node_modules
npm cache clean --force
npm install --legacy-peer-deps
npm run build
```

**See full troubleshooting**: Read "🔧 Troubleshooting" in DEPLOYMENT_GUIDE.md

---

## 📊 Architecture

```
User → React App (Amplify)
           ↓
       API Gateway
           ↓
       Lambda Function
           ↓
    AWS Secrets Manager (API key)
           ↓
    Anthropic Claude Haiku API
```

---

## 📞 Next Steps

1. **Complete DEPLOYMENT_GUIDE.md** - Full step-by-step setup
2. **Deploy Lambda** - Run PowerShell commands for Lambda + API Gateway
3. **Push to GitHub** - Connect to Amplify Console for auto-deployment
4. **Test in production** - Verify Claude search works on hosted app

---

## ✨ Features Enabled

- 🔍 **AI Photo Search**: Search using natural language powered by Claude
- 🎨 **Photo Upload**: Upload photos to secure S3 bucket
- 👤 **Authentication**: Cognito-based user management
- 🚀 **Serverless**: Lambda + API Gateway backend
- 🌐 **Global CDN**: CloudFront + S3 static hosting
- 🔒 **Enterprise Security**: Secrets Manager, IAM roles, HTTPS

---

**Questions?** See DEPLOYMENT_GUIDE.md for complete documentation.

**Status**: ✅ Ready to deploy!
