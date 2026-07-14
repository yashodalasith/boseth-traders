# Boseth Traders - Server Setup Guide

This is the backend API for the Boseth Traders e-commerce platform built with Express.js and MongoDB.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Technology Stack](#technology-stack)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 14.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 6.x or higher (comes with Node.js)
- **MongoDB**: Atlas account or local MongoDB instance ([Sign Up](https://www.mongodb.com/cloud/atlas))
- **Git**: For version control ([Download](https://git-scm.com/))
- **Postman** (Optional): For testing API endpoints ([Download](https://www.postman.com/downloads/))

## Project Overview

Boseth Traders Server is a RESTful API that provides:

- User authentication and authorization (JWT-based)
- OAuth 2.0 integration (Google & Facebook)
- Product management (CRUD operations)
- Category and brand management
- Sales tracking and reporting
- Inventory management
- Email notifications
- Image upload to Cloudinary
- Security features (rate limiting, XSS protection, etc.)

## Installation

### Step 1: Clone or Navigate to Repository

```bash
# If cloning from repository
git clone <repository-url>
cd boseth-traders/server

# Or if already in server folder
cd server
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:

- **Express** - Web application framework
- **Mongoose** - MongoDB object modeling
- **JWT** - Token-based authentication
- **Bcryptjs** - Password hashing
- **Dotenv** - Environment variable management
- **Cloudinary** - Image upload service
- **Nodemailer** - Email sending
- **Passport** - Authentication middleware
- **Helmet** - Security headers
- **CORS** - Cross-Origin Resource Sharing
- And other packages for security and validation

## Environment Setup

### Step 3: Create Environment File

Create a `.env` file in the server root directory:

```bash
touch .env
```

### Step 4: Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AppName

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client Configuration
CLIENT_URL=http://localhost:3000

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth - Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Detailed Variable Explanations:**

| Variable                | Description                   | How to Get                                                                               |
| ----------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `NODE_ENV`              | Environment mode              | `development` or `production`                                                            |
| `PORT`                  | Server port                   | Default: `5000`                                                                          |
| `MONGODB_URI`           | MongoDB connection string     | MongoDB Atlas                                                                            |
| `JWT_SECRET`            | Secret key for signing tokens | Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRE`            | Token expiration time         | `7d` (7 days), `24h`, etc.                                                               |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name       | [Cloudinary Dashboard](https://cloudinary.com/console)                                   |
| `CLOUDINARY_API_KEY`    | Cloudinary API key            | [Cloudinary Dashboard](https://cloudinary.com/console)                                   |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret         | [Cloudinary Dashboard](https://cloudinary.com/console)                                   |
| `CLIENT_URL`            | Frontend URL                  | `http://localhost:3000`                                                                  |
| `GOOGLE_CLIENT_ID`      | Google OAuth ID               | [Google Cloud Console](https://console.cloud.google.com/)                                |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth secret           | [Google Cloud Console](https://console.cloud.google.com/)                                |
| `FACEBOOK_APP_ID`       | Facebook App ID               | [Facebook Developers](https://developers.facebook.com/)                                  |
| `FACEBOOK_APP_SECRET`   | Facebook App Secret           | [Facebook Developers](https://developers.facebook.com/)                                  |
| `EMAIL_USER`            | Gmail account                 | Your Gmail address                                                                       |
| `EMAIL_PASS`            | Gmail app password            | [Generate app password](https://myaccount.google.com/apppasswords)                       |

### Step 4a: Detailed Setup Guide for Each Service

**MongoDB Atlas Setup:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account or login
3. Create a new cluster
4. Go to Database Access and create user
5. Go to Network Access and add IP (0.0.0.0/0 for development)
6. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

**Cloudinary Setup:**

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret
4. Create uploads folder for products

**Google OAuth Setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable OAuth 2.0
4. Create OAuth Client ID (Web application)
5. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret

**Facebook OAuth Setup:**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app
3. Set up Facebook Login product
4. Valid OAuth Redirect URIs: `http://localhost:5000/api/auth/facebook/callback`
5. Copy App ID and App Secret

**Gmail Setup:**

1. Enable 2-factor authentication
2. Generate app password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use generated password in `EMAIL_PASS`

## Database Setup

### Step 5: Initialize Database

Create initial database structure and seed data:

```bash
npm run init-db
```

This script will:

- Connect to MongoDB
- Create collections (Users, Items, Categories, Brands, Sales)
- Insert sample data
- Create necessary indexes

## Running the Server

### Step 6: Start Development Server

Use nodemon for automatic restart on file changes:

```bash
npm run dev
```

Expected output:

```
✅ Database connected successfully
✅ Server running on port 5000
```

The API will be available at `http://localhost:5000/api`

### Step 7: Start Production Server

```bash
npm start
```

### Verify Server is Running

Test the server with a simple request:

```bash
curl http://localhost:5000/api/items
```

Or in Postman: GET `http://localhost:5000/api/items`

## API Endpoints

### Authentication Routes (`/api/auth`)

```
POST   /register              - Register new user
POST   /login                 - Login user
POST   /logout                - Logout user
GET    /profile               - Get user profile (protected)
POST   /forgot-password       - Request password reset
POST   /reset-password/:token - Reset password
GET    /google                - Google OAuth login
GET    /google/callback       - Google OAuth callback
GET    /facebook              - Facebook OAuth login
GET    /facebook/callback     - Facebook OAuth callback
```

### Products/Items Routes (`/api/items`)

```
GET    /                      - Get all items with filters
GET    /:id                   - Get single item
POST   /                      - Create item (admin only)
PATCH  /:id                   - Update item (admin only)
DELETE /:id                   - Delete item (admin only)
```

### Categories Routes (`/api/categories`)

```
GET    /                      - Get all categories
POST   /                      - Create category (admin only)
PATCH  /:id                   - Update category (admin only)
DELETE /:id                   - Delete category (admin only)
```

### Brands Routes (`/api/brands`)

```
GET    /                      - Get all brands
POST   /                      - Create brand (admin only)
PATCH  /:id                   - Update brand (admin only)
DELETE /:id                   - Delete brand (admin only)
```

### Sales Routes (`/api/sales`)

```
GET    /                      - Get all sales (protected)
POST   /                      - Create sale (protected)
GET    /:id                   - Get sale details (protected)
GET    /analytics/summary     - Get sales analytics (admin only)
```

### Users Routes (`/api/users`)

```
GET    /                      - Get all users (admin only)
GET    /:id                   - Get user details (admin only)
PATCH  /:id                   - Update user (admin only)
DELETE /:id                   - Delete user (admin only)
```

## Project Structure

```
server/
├── controllers/           # Request handlers for routes
│   ├── authController.js
│   ├── itemController.js
│   ├── categoryController.js
│   ├── brandController.js
│   ├── salesController.js
│   └── userController.js
├── middleware/            # Custom middleware functions
│   ├── auth.js            # JWT authentication middleware
│   ├── admin.js           # Admin authorization middleware
│   ├── security.js        # Security middleware
│   └── validation.js      # Request validation middleware
├── models/                # Mongoose schemas
│   ├── User.js            # User schema with methods
│   ├── Item.js            # Product schema
│   ├── Category.js        # Category schema
│   ├── Brand.js           # Brand schema
│   └── Sale.js            # Sales transaction schema
├── routes/                # Express route definitions
│   ├── auth.js            # Authentication routes
│   ├── items.js           # Item management routes
│   ├── categories.js      # Category routes
│   ├── brands.js          # Brand routes
│   ├── sales.js           # Sales routes
│   └── users.js           # User management routes
├── utils/                 # Utility functions
│   ├── cloudinary.js      # Cloudinary upload config
│   └── email.js           # Email sending utility
├── scripts/               # Helper scripts
│   └── initDB.js          # Database initialization
├── uploads/               # Local upload storage (if needed)
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
├── index.js              # Main server file
└── package.json          # Dependencies and scripts
```

## Security Features

The server includes multiple layers of security:

### 1. **Authentication**

- JWT token-based authentication
- Automatic token refresh
- Secure password hashing with bcryptjs
- Session management

### 2. **Authorization**

- Role-based access control (Admin/User)
- Protected routes middleware
- Admin-only endpoints

### 3. **Data Protection**

- **Helmet** - Sets security HTTP headers
- **XSS Protection** - Clean user input with xss-clean
- **Mongo Sanitize** - Prevent NoSQL injection
- **HPP** - Parameter Pollution Protection

### 4. **Rate Limiting**

- Prevent brute force attacks
- API rate limiting per IP
- Custom limits per endpoint

### 5. **CORS**

- Cross-origin requests properly configured
- Only allow requests from CLIENT_URL
- Credentials allowed for authenticated requests

### 6. **Input Validation**

- Express validator for request validation
- Schema validation with Mongoose
- Type checking and sanitization

## Technology Stack

### Runtime & Framework

- **Node.js** - JavaScript runtime
- **Express 5.1** - Web framework
- **Nodemon** - Development auto-restart

### Database

- **MongoDB** - NoSQL database
- **Mongoose 8.18** - ODM (Object Document Mapper)

### Authentication

- **JWT** - Token-based authentication
- **Bcryptjs** - Password hashing
- **Passport** - Authentication middleware
- **Passport Google OAuth 2.0**
- **Passport Facebook**

### Security

- **Helmet** - Security headers
- **CORS** - Cross-origin handling
- **express-rate-limit** - Rate limiting
- **express-mongo-sanitize** - NoSQL injection prevention
- **xss-clean** - XSS attack prevention
- **hpp** - Parameter pollution protection
- **express-validator** - Input validation

### File & Image Management

- **Multer** - File upload handling
- **Multer Storage Cloudinary** - Cloudinary integration
- **Cloudinary** - Image hosting and manipulation

### Email & Notifications

- **Nodemailer** - Email sending
- **Gmail SMTP** - Email service

### Environment & Config

- **Dotenv** - Environment variables

## Common Tasks

### Creating a New API Endpoint

1. **Create Controller** in `controllers/newController.js`:

```javascript
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

2. **Create Route** in `routes/items.js`:

```javascript
const express = require("express");
const { getItems } = require("../controllers/itemController");
const router = express.Router();

router.get("/", getItems);

module.exports = router;
```

3. **Add Route to Server** in `index.js`:

```javascript
app.use("/api/items", require("./routes/items"));
```

### Adding Authentication to Routes

```javascript
const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/admin");

// Protected route (user must be logged in)
router.get("/", protect, getItems);

// Admin only route
router.post("/", protect, restrictTo("admin"), createItem);
```

### Sending Emails

```javascript
const emailUtil = require("../utils/email");

await emailUtil.sendEmail({
  email: user.email,
  subject: "Welcome to Boseth Traders",
  message: "Thank you for registering!",
});
```

### Uploading Images

```javascript
const multer = require("multer");
const { cloudinaryStorage, parser } = require("../utils/cloudinary");

const upload = multer({ storage: cloudinaryStorage });

router.post("/upload", upload.single("image"), (req, res) => {
  res.json({ imageUrl: req.file.path });
});
```

## Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create boseth-traders-api`
4. Add environment variables:

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_mongodb_uri
# ... set other env vars
```

5. Deploy: `git push heroku main`

### Deploy to Railway

1. Sign up at [Railway](https://railway.app)
2. Connect GitHub repository
3. Add environment variables in dashboard
4. Auto-deploy on push

### Deploy to AWS/Azure/GCP

Use their respective container or compute services with Docker.

## Troubleshooting

### Issue: Cannot connect to MongoDB

**Error:** `MongooseError: Cannot connect to MongoDB`

**Solution:**

1. Verify MongoDB URI in `.env` is correct
2. Check MongoDB Atlas network access (add your IP)
3. Verify username and password are correct
4. Check internet connection

```bash
# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.log(e))"
```

### Issue: Port 5000 already in use

**Solution:**

```bash
# Find and kill process on Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# On macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### Issue: JWT token not working

**Solution:**

1. Verify JWT_SECRET is set in `.env`
2. Check token format in Authorization header: `Bearer <token>`
3. Verify token hasn't expired
4. Check client is sending token correctly

### Issue: CORS error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**

1. Verify CLIENT_URL in `.env` matches frontend URL
2. Check CORS configuration in `index.js`
3. Ensure `credentials: true` is set

### Issue: Cloudinary uploads failing

**Solution:**

1. Verify all Cloudinary credentials in `.env`
2. Check Cloudinary dashboard for upload folder
3. Verify file size isn't exceeding limit
4. Test credentials with: `npm test`

### Issue: Email not sending

**Solution:**

1. Verify EMAIL_USER and EMAIL_PASS are correct
2. Ensure Gmail 2FA is enabled
3. Use app password (not regular password)
4. Check "Less secure apps" setting if using regular password
5. Test email configuration

### Issue: OAuth not working

**Solution:**

1. Verify OAuth credentials are correct
2. Check redirect URIs match exactly
3. Verify CLIENT_URL is accessible
4. Check browser console for error details
5. Verify OAuth provider is configured correctly

### Issue: Nodemon not restarting on changes

**Solution:**

```bash
# Clear nodemon cache
rm -rf .nodemon*

# Reinstall nodemon
npm install --save-dev nodemon

# Run again
npm run dev
```

## Performance Tips

1. **Enable Database Indexing:**

```javascript
// In models
userSchema.index({ email: 1 }); // Index email field
```

2. **Use Pagination:**

```javascript
const items = await Item.find()
  .limit(10)
  .skip((page - 1) * 10);
```

3. **Cache Frequently Accessed Data:**

```javascript
const cache = {};
// Store and retrieve from cache
```

4. **Monitor with PM2:**

```bash
npm install -g pm2
pm2 start index.js --name boseth-api
pm2 monit
```

## Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [JWT Guide](https://jwt.io/introduction)
- [Passport.js](http://www.passportjs.org/)
- [Cloudinary Docs](https://cloudinary.com/documentation)

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review server logs for error messages
3. Verify environment variables
4. Check API documentation
5. Review middleware chain

---

**Last Updated:** January 2026
**Version:** 1.0.0
