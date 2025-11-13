# AWS Photo Gallery with Claude Haiku 4.5

A smart photo gallery application with AI-powered search using Claude Haiku 4.5, hosted on AWS with React, AWS Amplify, and serverless backend.

## 🎯 Features

- ✅ **AI-Powered Photo Search** - Search photos using natural language powered by Claude Haiku 4.5
- ✅ **Secure Authentication** - Cognito-based user authentication
- ✅ **Photo Upload** - Store photos in private S3 buckets
- ✅ **Serverless Backend** - Lambda + API Gateway integration
- ✅ **Fully Hosted on AWS** - Amplify Console for CI/CD deployment
- ✅ **Enterprise Security** - Secrets Manager for API keys, IAM roles, and CORS protection

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API endpoint

# Start development server
npm start
```

Visit `http://localhost:3000` and log in with your Cognito credentials.

### Deployment to AWS

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete step-by-step instructions including:
- Security setup (revoking exposed keys)
- Lambda function deployment
- API Gateway configuration
- Amplify Console hosting
- Environment configuration

## 📁 Project Structure

```
aws-photo-gallery/
├── src/
│   ├── App.js                 # Main app component with Claude status
│   ├── SearchPanel.js         # AI search UI with Claude integration
│   ├── claudeClient.js        # Frontend utility for calling Claude Lambda
│   ├── PhotoGallery.js        # Gallery view component
│   ├── UploadForm.js          # Photo upload form
│   ├── amplify-config.js      # AWS Amplify configuration
│   └── styles.css
├── lambda/
│   ├── claude-haiku-handler.js # Lambda function for Claude API integration
│   └── package.json
├── public/
├── amplify.yml                # Amplify build configuration
├── DEPLOYMENT_GUIDE.md        # Complete deployment instructions
└── .github/
    └── workflows/
        └── deploy.yml         # GitHub Actions CI/CD workflow
```

## 🤖 Claude Haiku 4.5 Integration

The app integrates Claude Haiku 4.5 for intelligent photo search:

**Frontend Flow:**
1. User enters search query in SearchPanel
2. Query sent to Lambda via API Gateway
3. Lambda calls Claude Haiku 4.5 API
4. Response used to enhance photo search results

**Security:**
- Anthropic API key stored in AWS Secrets Manager
- Lambda has minimal IAM permissions
- All communication via HTTPS
- API Gateway provides CORS protection

## 🔐 Security

- ✅ No credentials in source code
- ✅ Secrets Manager for API keys
- ✅ IAM roles with least privilege
- ✅ HTTPS-only endpoints
- ✅ CORS-protected API Gateway

⚠️ **If you see exposed credentials anywhere:**
1. Immediately revoke them in AWS Console
2. Follow the security section in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 💻 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm run test

# Eject (one-way - do not use unless necessary)
npm run eject
```

## 🏗️ Technology Stack

- **Frontend**: React 19, AWS Amplify UI
- **Backend**: AWS Lambda, API Gateway
- **Database**: Amazon DynamoDB (via Amplify)
- **Storage**: Amazon S3
- **Auth**: Amazon Cognito
- **AI Model**: Anthropic Claude Haiku 4.5
- **Hosting**: AWS Amplify Console
- **Secrets**: AWS Secrets Manager

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Web Browser                         │
│              (React App on Amplify)                     │
└─────────────────────────────────────────────────────────┘
                         ↓ (HTTPS)
┌─────────────────────────────────────────────────────────┐
│               AWS API Gateway                           │
│          (CORS-protected endpoints)                     │
└─────────────────────────────────────────────────────────┘
                         ↓
    ┌────────────────────┬────────────────────┐
    ↓                    ↓
┌──────────────┐   ┌──────────────────┐
│   Lambda     │   │  Cognito Auth    │
│  (Claude)    │   │                  │
└──────────────┘   └──────────────────┘
    ↓                    
┌──────────────────────────────────┐
│  AWS Secrets Manager (API keys)  │
└──────────────────────────────────┘
    ↓
┌──────────────────────────────────┐
│    Anthropic Claude Haiku API    │
└──────────────────────────────────┘
```

## 📖 Learn More

- [Create React App Documentation](https://create-react-app.dev/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [AWS Lambda](https://aws.amazon.com/lambda/)

## ⚙️ Configuration

### Environment Variables

See `.env.example` for all available options:
- `REACT_APP_CLAUDE_API_URL` - Lambda API Gateway endpoint

### AWS Resources

- **Cognito User Pool**: `ap-south-1_yEjd6Lsmj`
- **S3 Bucket**: `abdul-photo-vault-original-2025`
- **Region**: `ap-south-1` (Mumbai)

## 🆘 Troubleshooting

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#-troubleshooting)** for common issues and solutions.

---

**Status**: ✅ Claude Haiku 4.5 enabled for all clients

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
