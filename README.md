# Grocery Delivery Platform

A modern grocery delivery platform that offers an intuitive and engaging online shopping experience, combining convenience with cutting-edge user interface design.

![Grocery Delivery App](https://img.shields.io/badge/Grocery-Delivery-green)
![React](https://img.shields.io/badge/React-18-blue)
![Express](https://img.shields.io/badge/Express-4-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## Features

- Browse product categories
- Search products
- Add items to cart
- Checkout process
- User account management
- Admin dashboard for inventory and order management

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Express.js
- Database: PostgreSQL
- Styling: Tailwind CSS and shadcn components

## Deployment to Render

This application is configured for easy deployment to Render, a cloud platform with a generous free tier.

### Steps to deploy:

1. Create a Render account at https://render.com
2. Push this repository to GitHub:
   - Create a GitHub repository
   - Push the code to GitHub using the instructions provided on GitHub
3. In your Render dashboard, click "New" and select "Blueprint"
4. Connect your GitHub account and select this repository
5. Render will automatically set up your web service and PostgreSQL database based on the render.yaml configuration

### Manual deployment:

1. Create a new PostgreSQL database on Render:
   - Go to your Render dashboard
   - Click "New" and select "PostgreSQL"
   - Choose the free plan
   - Set a name (e.g., "grocery-db")
   - Click "Create Database"
   - Wait for the database to be provisioned
   - Copy the "Internal Database URL" (NOT the external one)

2. Create a new Web Service on Render:
   - Go to your Render dashboard
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Choose a name (e.g., "grocery-app")
   - Keep the environment as "Node"
   - Set the build command to: `npm install`
   - Set the start command to: `./start.sh`
   - Click "Advanced" and add the following environment variable:
     - Key: `DATABASE_URL`
     - Value: (paste the Internal Database URL from step 1)
   - Click "Create Web Service"

### Troubleshooting deployment issues:

If your deployment fails, check the following:

1. **Database connection**: Make sure the DATABASE_URL environment variable is using the Internal Database URL provided by Render (not the External Database URL).

2. **Build process**: Check the build logs in Render for any errors. If there are issues with npm packages, you may need to update the Node.js version in your service settings.

3. **Permissions**: Ensure the start.sh script is executable. You can do this by running `chmod +x start.sh` before pushing to GitHub.

4. **Database initialization**: If the database initialization fails, you can manually run the SQL scripts via the Render PostgreSQL shell. Go to your database in the Render dashboard and click "Shell".

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the environment variables in .env file
4. Start the development server: `npm run dev`

## License

MIT