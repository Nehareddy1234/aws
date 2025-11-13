# 🚀 Deployment Checklist - Claude Haiku 4.5 Photo Gallery

Use this checklist to track your deployment progress.

## Phase 1: Security & Preparation ⚠️

- [ ] **Revoke exposed AWS credentials**
  - [ ] Sign into AWS Console → IAM → Users
  - [ ] Find and delete access key `AKIA6OCOD7CIMZT7IJLN`
  - [ ] Create new AWS credentials
  - [ ] Run `aws configure` with new credentials
  - [ ] Verify old keys removed from Git history (run: `git log --all -p -S "AKIA"`)

- [ ] **Prepare Anthropic API Key**
  - [ ] Get API key from https://console.anthropic.com/account/keys
  - [ ] Note: Keep this key safe, never commit to Git

## Phase 2: AWS Backend Setup 🏗️

- [ ] **Store Anthropic API Key in Secrets Manager**
  ```powershell
  aws secretsmanager create-secret `
    --name anthropic/api-key `
    --secret-string "sk-ant-YOUR_KEY" `
    --region ap-south-1
  ```

- [ ] **Create IAM Role for Lambda**
  - [ ] Role name: `claude-haiku-lambda-role`
  - [ ] Trust policy: Allow Lambda service
  - [ ] Permissions: 
    - [ ] `AWSLambdaBasicExecutionRole`
    - [ ] `secretsmanager:GetSecretValue` for `anthropic/api-key`

- [ ] **Deploy Lambda Function**
  - [ ] Install Lambda dependencies: `cd lambda && npm install`
  - [ ] Package Lambda: `Compress-Archive -Path "lambda/*" -DestinationPath lambda.zip`
  - [ ] Deploy to AWS Lambda
  - [ ] Function name: `claude-haiku-handler`
  - [ ] Runtime: Node.js 18.x
  - [ ] Timeout: 30 seconds

- [ ] **Create API Gateway**
  - [ ] Create REST API: `claude-haiku-api`
  - [ ] Create resource: `/claude`
  - [ ] Create POST method
  - [ ] Integrate with Lambda
  - [ ] Enable CORS
  - [ ] Deploy to `prod` stage
  - [ ] Save endpoint URL: `https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod/claude`

## Phase 3: Local Configuration 🔧

- [ ] **Create .env.local**
  ```bash
  cp .env.local
  ```
  - [ ] Add: `REACT_APP_CLAUDE_API_URL=https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod/claude`

- [ ] **Test Local Build**
  ```powershell
  npm install --legacy-peer-deps
  npm run build
  ```
  - [ ] Build succeeds with no errors
  - [ ] Build folder created

- [ ] **Test Local Dev Server** (with API configured)
  ```powershell
  npm start
  ```
  - [ ] App runs on localhost:3000
  - [ ] Can log in with Cognito
  - [ ] Claude search works (try searching for a photo)

## Phase 4: GitHub & Amplify Deployment 🚀

- [ ] **Commit code to Git**
  ```powershell
  git add .
  git commit -m "Add Claude Haiku 4.5 integration"
  git push origin main
  ```
  - [ ] Code pushed to GitHub main branch
  - [ ] No secrets in committed files
  - [ ] Verify `.env.local` in `.gitignore`

- [ ] **Connect to Amplify Console**
  - [ ] Go to https://console.aws.amazon.com/amplify/
  - [ ] Click "Create app" → "Deploy an app"
  - [ ] Select GitHub and authorize
  - [ ] Select repository
  - [ ] Select branch: `main`
  - [ ] Accept build settings
  - [ ] Click "Create app"

- [ ] **Add Environment Variables in Amplify Console**
  - [ ] Go to Amplify app → "App settings" → "Environment variables"
  - [ ] Add:
    - [ ] Key: `REACT_APP_CLAUDE_API_URL`
    - [ ] Value: `https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod/claude`
  - [ ] Save and trigger redeploy

- [ ] **Wait for Amplify Deployment**
  - [ ] Build starts automatically
  - [ ] Check build logs for errors
  - [ ] Build completes successfully
  - [ ] App gets auto-generated URL

- [ ] **Configure Custom Domain** (optional)
  - [ ] Go to Amplify → "Domain management"
  - [ ] Add custom domain
  - [ ] Configure DNS records
  - [ ] Enable HTTPS

## Phase 5: Testing & Verification ✅

- [ ] **Test Production Deployment**
  - [ ] Visit Amplify URL in browser
  - [ ] Log in with Cognito credentials
  - [ ] Check that "🤖 Claude Haiku 4.5 Enabled" badge appears
  - [ ] Try AI search feature:
    - [ ] Search for "light in photos"
    - [ ] Search for "cat or dog"
    - [ ] Search for "sunset"
  - [ ] Verify search results appear

- [ ] **Verify API Integration**
  - [ ] Open browser DevTools → Network tab
  - [ ] Search for a photo
  - [ ] Check that POST request goes to Lambda endpoint
  - [ ] Response should contain AI analysis
  - [ ] No errors in console

- [ ] **Check CloudWatch Logs**
  ```powershell
  aws logs tail /aws/lambda/claude-haiku-handler --follow --region ap-south-1
  ```
  - [ ] Lambda logs show successful invocations
  - [ ] No errors or timeouts
  - [ ] API key retrieval succeeds

- [ ] **Test Error Handling**
  - [ ] Try searching with special characters
  - [ ] Try very long search queries
  - [ ] Verify fallback to regular search if Claude fails

## Phase 6: Security Verification 🔒

- [ ] **Verify No Credentials Exposed**
  - [ ] Check source code has no AWS keys
  - [ ] Check source code has no Anthropic keys
  - [ ] Run: `git grep -n "AKIA" || git grep -n "sk-ant"`
  - [ ] Result should be empty (no matches)

- [ ] **Verify Secrets Manager**
  - [ ] API key stored in Secrets Manager: `anthropic/api-key`
  - [ ] Run: `aws secretsmanager describe-secret --secret-id anthropic/api-key --region ap-south-1`
  - [ ] Verify: `"DeletedDate": null` (not scheduled for deletion)

- [ ] **Verify IAM Permissions**
  - [ ] Lambda role: `claude-haiku-lambda-role`
  - [ ] Has `AWSLambdaBasicExecutionRole`
  - [ ] Has inline policy for `secretsmanager:GetSecretValue`
  - [ ] Run: `aws iam list-attached-role-policies --role-name claude-haiku-lambda-role`

- [ ] **Verify API Gateway Security**
  - [ ] CORS enabled on `/claude` POST method
  - [ ] Authorization set to NONE (or API Key if preferred)
  - [ ] Throttling configured (optional)

## Phase 7: Optimization & Monitoring 📊

- [ ] **Enable CloudWatch Monitoring**
  - [ ] Lambda: Check invocation count and duration
  - [ ] API Gateway: Check request count and errors
  - [ ] Set up CloudWatch alarms for:
    - [ ] Lambda errors > 1%
    - [ ] API Gateway 5XX errors > 0

- [ ] **Optimize Performance**
  - [ ] Check Lambda cold start time
  - [ ] Check API Gateway latency
  - [ ] Measure Claude API response time

- [ ] **Set Up Cost Alerts**
  - [ ] AWS Billing Alerts: Set threshold at $20/month
  - [ ] Receive email if costs exceed threshold

## Phase 8: Documentation & Handoff 📚

- [ ] **Complete Documentation**
  - [ ] DEPLOYMENT_GUIDE.md reviewed
  - [ ] QUICK_START.md reviewed
  - [ ] README.md updated with production URL

- [ ] **Share Access Credentials**
  - [ ] Team members have AWS account access
  - [ ] GitHub repo access configured
  - [ ] Amplify Console permissions set

- [ ] **Create Runbook**
  - [ ] Document how to deploy changes
  - [ ] Document how to rollback
  - [ ] Document how to debug issues

---

## 🎉 Deployment Complete!

Once all checkboxes are checked, your Claude Haiku 4.5 Photo Gallery is:
- ✅ Deployed to AWS Amplify
- ✅ Connected to Claude Haiku backend
- ✅ Secured with Secrets Manager
- ✅ Ready for production use

---

## 🚨 Troubleshooting

If deployment fails at any step:

1. **Build fails in Amplify**
   - Check build logs in Amplify Console
   - Verify `amplify.yml` syntax
   - Run `npm run build` locally to reproduce

2. **Lambda returns 403**
   - Check IAM role has Secrets Manager permission
   - Verify secret name is `anthropic/api-key`
   - Check secret is not marked for deletion

3. **CORS errors in browser**
   - Check API Gateway CORS configuration
   - Verify Lambda returns proper headers
   - Check browser console for specific error

4. **Claude search doesn't work**
   - Verify API endpoint URL in `.env.local` and Amplify
   - Check CloudWatch logs for Lambda errors
   - Verify Anthropic API key is valid

5. **Build passes locally but fails in Amplify**
   - Check `amplify.yml` build commands
   - Verify Node version matches
   - Check npm dependencies are locked

---

## 📞 Support

For detailed troubleshooting:
- See: `DEPLOYMENT_GUIDE.md` → Troubleshooting section
- Check: CloudWatch logs
- Review: Browser DevTools Network tab

---

**Last Updated**: November 13, 2025
**Status**: Ready for Deployment ✅
