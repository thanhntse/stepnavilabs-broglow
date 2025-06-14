# BroGlow API - Railway Deployment Guide

This guide provides instructions for deploying the BroGlow API and MongoDB database to Railway.

## Prerequisites

1. A [Railway](https://railway.app/) account
2. The [Railway CLI](https://docs.railway.app/develop/cli) installed (optional but recommended)
3. Git installed on your machine

## Deployment Steps

### Step 1: Fork or Clone the Repository

Make sure you have a copy of this repository on your GitHub account or local machine.

### Step 2: Create a New Project on Railway

1. Log in to your Railway account
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select the BroGlow repository

### Step 3: Add MongoDB Database

1. In your Railway project, click "New"
2. Select "Database" → "MongoDB"
3. Wait for the database to be provisioned

### Step 4: Configure Environment Variables

In your Railway project, go to the "Variables" tab and add the following environment variables:

```
NODE_ENV=production
APP_NAME=BroGlow
MONGODB_URI=${{Mongo.DATABASE_URL}}
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_openai_assistant_id
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-railway-app-url.railway.app/api/auth/google/redirect
PUBLIC_URL=https://your-railway-app-url.railway.app
EMAIL_SENDER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

Replace `your_*` values with your actual credentials and secrets. The `MONGODB_URI` will automatically reference the MongoDB instance you created.

### Step 5: Deploy

Railway will automatically deploy your application based on the configuration in the `railway.toml` file.

If you're using the Railway CLI:

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Deploy
railway up
```

### Step 6: Verify Deployment

1. Once deployment is complete, Railway will provide you with a URL for your application
2. Visit `https://your-railway-app-url.railway.app/api` to access the Swagger documentation

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database, check:
1. The `MONGODB_URI` environment variable is correctly set
2. The MongoDB instance is running
3. Network rules allow connections from your application

### Application Not Starting

Check the logs in the Railway dashboard for error messages. Common issues include:
1. Missing environment variables
2. Build failures
3. Port conflicts

## Maintenance

To update your deployed application:
1. Push changes to your GitHub repository
2. Railway will automatically detect changes and redeploy

For manual deployments using the CLI:
```bash
railway up
```
