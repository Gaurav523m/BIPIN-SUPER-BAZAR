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
2. Fork this repository to your GitHub account
3. In your Render dashboard, click "New" and select "Blueprint"
4. Connect your GitHub account and select this repository
5. Render will automatically set up your web service and PostgreSQL database based on the render.yaml configuration

### Manual deployment:

1. Create a new PostgreSQL database on Render
2. Create a new Web Service on Render
3. Link the repository
4. Set the following environment variables:
   - DATABASE_URL: Your Render PostgreSQL connection string
5. Set the build command to: `npm install`
6. Set the start command to: `./start.sh`

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the environment variables in .env file
4. Start the development server: `npm run dev`

## License

MIT