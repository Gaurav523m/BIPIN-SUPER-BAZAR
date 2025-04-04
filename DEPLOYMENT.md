# Deployment Guide for Grocery App

This guide explains how to deploy your Grocery Delivery app on Render.com using your existing Replit database.

## Prerequisites

1. A Render.com account
2. Your existing Replit PostgreSQL database credentials
3. Your application code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Export Database Environment Variables

Before deploying, make sure you have the following database environment variables from your Replit project:

- `DATABASE_URL`
- `PGDATABASE`
- `PGHOST`
- `PGPASSWORD`
- `PGPORT` (Make sure this is a valid numeric port number, usually 5432)
- `PGUSER`

You can find these in Replit by going to "Secrets" in the left sidebar of your project.

### Important Notes About Database Connection

- The deployment script will automatically validate the PGPORT variable to ensure it's a valid numeric value.
- The script will first try to connect using the DATABASE_URL environment variable.
- If that fails, it will fall back to using the individual connection parameters (PGHOST, PGUSER, etc.).

### 2. Deploy to Render

There are two ways to deploy to Render:

#### Option A: Deploy via Dashboard (Manual)

1. Log in to your Render account
2. Create a new Web Service
   - Connect your Git repository
   - Use the following settings:
     - Name: `grocery-app`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `./start.sh`
   - Add the environment variables from Step 1
   - Choose the Free plan
   - Click "Create Web Service"

#### Option B: Deploy via Blueprint (Automated)

1. Log in to your Render account
2. Go to the Dashboard and select "Blueprints"
3. Click "New Blueprint Instance"
4. Connect your Git repository
5. Render will automatically detect the `render.yaml` file
6. Add the environment variables from Step 1
7. Click "Apply"

### 3. Verify Deployment

1. Wait for the deployment to complete
2. Visit your application URL (will be in the format `https://grocery-app.onrender.com`)
3. Test the various functionality of your application
   - User login/registration
   - Product browsing
   - Shopping cart
   - Checkout process
   - Order history

### Troubleshooting

#### Common Deployment Issues

1. **Invalid PGPORT value**:
   - Error: `psql: error: invalid integer value "640a0d7e834a039fc1cedd5d9aa3a7bc" for connection option "port"`
   - Solution: Ensure your PGPORT is set to a numeric value (typically 5432). The updated start.sh script now automatically handles this.

2. **Vite Not Found**:
   - Error: `sh: 1: vite: not found` followed by `ERROR: Could not find server file in dist directory!`
   - Solution: The updated start.sh script now directly calls npx for both vite and esbuild build steps.

3. **Other Issues**:
   - Check Render logs for specific errors
   - Ensure all environment variables are correctly set
   - Verify that your database is accessible from Render
   - Check if the session table was created properly

### Important Notes

- The free tier of Render has usage limitations
- Your web service on the free tier will sleep after periods of inactivity
- The first request after inactivity may take up to 30 seconds to respond
- For a production environment, consider upgrading to a paid tier

## Maintenance

To update your application:

1. Push changes to your Git repository
2. Render will automatically rebuild and deploy your application

## Database Backups

Regularly backup your Replit database to prevent data loss:

1. Use SQL export features in Replit
2. Store backup files securely