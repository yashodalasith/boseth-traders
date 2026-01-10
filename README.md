# Boseth Traders - Complete Platform Setup Guide

Welcome to **Boseth Traders**, a full-stack e-commerce platform for buying and selling products with advanced inventory management, user authentication, and admin controls.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
- [Complete Installation Guide](#complete-installation-guide)
- [Running the Platform](#running-the-platform)
- [Platform Features](#platform-features)
- [Environment Configuration](#environment-configuration)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

## System Overview

Boseth Traders is a **full-stack e-commerce application** consisting of:

### Frontend (React + Vite)

- Modern, responsive user interface
- Real-time product browsing
- User authentication (Email, Google OAuth, Facebook OAuth)
- Shopping cart functionality
- Admin dashboard for inventory management
- Sales tracking and analytics

### Backend (Express.js + MongoDB)

- RESTful API for all operations
- JWT-based authentication
- OAuth 2.0 integration (Google & Facebook)
- Image upload with Cloudinary
- Email notifications
- Role-based access control (Admin/User)
- Security features (rate limiting, XSS protection, etc.)

### Database (MongoDB)

- NoSQL database for flexible data storage
- Scalable architecture
- Real-time data synchronization

## Quick Start

If you just want to get everything running quickly:

```bash
# 1. Clone repository
git clone <repository-url>
cd boseth-traders

# 2. Setup Backend
cd server
npm install
# Create .env file with variables (see below)
npm run init-db
npm run dev

# 3. In new terminal, Setup Frontend
cd ../client
npm install
# Create .env file with variables (see below)
npm run dev

# 4. Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api
```

## Technology Stack

### Full Stack Overview

```
┌─────────────────────────────────────────────┐
│         CLIENT (Frontend)                   │
│  React 19 + Vite + Tailwind CSS            │
│  - SPA with React Router                    │
│  - Context API for state management         │
│  - Responsive UI with animations            │
└────────────┬────────────────────────────────┘
             │ HTTP/CORS
             ▼
┌─────────────────────────────────────────────┐
│         SERVER (Backend)                    │
│  Express.js + Node.js                      │
│  - RESTful API                              │
│  - JWT Authentication                       │
│  - OAuth 2.0 (Google, Facebook)            │
│  - Security middleware                      │
└────────────┬────────────────────────────────┘
             │ Mongoose ODM
             ▼
┌─────────────────────────────────────────────┐
│         DATABASE                            │
│  MongoDB Atlas (Cloud) / Local MongoDB      │
│  - Users Collection                         │
│  - Items Collection                         │
│  - Categories Collection                    │
│  - Brands Collection                        │
│  - Sales Collection                         │
└─────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│    EXTERNAL SERVICES                        │
│  - Cloudinary (Image hosting)              │
│  - Gmail (Email sending)                    │
│  - Google OAuth (Authentication)            │
│  - Facebook OAuth (Authentication)          │
└─────────────────────────────────────────────┘
```

### Frontend Technologies

| Component   | Technology       | Version |
| ----------- | ---------------- | ------- |
| Framework   | React            | 19.1    |
| Build Tool  | Vite             | 7.1     |
| Routing     | React Router DOM | 7.8     |
| Styling     | Tailwind CSS     | 3.4     |
| HTTP Client | Axios            | 1.11    |
| Animations  | Framer Motion    | 12.23   |
| Icons       | Lucide React     | 0.542   |
| Charts      | Recharts         | 3.1     |

### Backend Technologies

| Component        | Technology          | Version |
| ---------------- | ------------------- | ------- |
| Framework        | Express             | 5.1     |
| Database         | MongoDB             | Latest  |
| ODM              | Mongoose            | 8.18    |
| Authentication   | JWT                 | 9.0     |
| Password Hashing | Bcryptjs            | 3.0     |
| OAuth            | Passport            | 0.7     |
| Image Upload     | Multer + Cloudinary | Latest  |
| Email            | Nodemailer          | 7.0     |
| Security         | Helmet              | 8.1     |
| Rate Limiting    | express-rate-limit  | 8.0     |

## Prerequisites

### System Requirements

- **Operating System:** Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **RAM:** Minimum 4GB, Recommended 8GB+
- **Disk Space:** 2GB for node_modules and dependencies

### Required Software

All of the following must be installed before starting:

1. **Node.js & npm** (LTS version recommended)

   - [Download Node.js](https://nodejs.org/)
   - Verify installation: `node --version && npm --version`
   - Minimum versions: Node 16+, npm 8+

2. **Git** (for version control)

   - [Download Git](https://git-scm.com/)
   - Verify installation: `git --version`

3. **MongoDB Account** (free tier available)
   - [Create MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)
   - Or install [Local MongoDB](https://www.mongodb.com/try/download/community)

### Optional Tools

- **Postman** - API testing tool ([Download](https://www.postman.com/downloads/))
- **VS Code** - Code editor ([Download](https://code.visualstudio.com/))
- **MongoDB Compass** - MongoDB GUI ([Download](https://www.mongodb.com/products/compass))

### External Services Accounts

You'll need to create accounts on these services:

- **Cloudinary** - Image hosting ([Sign Up](https://cloudinary.com/))
- **Gmail** - Email service (use your existing Gmail)
- **Google Cloud Console** - OAuth ([Sign Up](https://console.cloud.google.com/))
- **Facebook Developers** - OAuth ([Sign Up](https://developers.facebook.com/))

## Architecture

### System Architecture Diagram

```
USERS
  │
  ├─→ [Browser/Mobile Client]
  │        │
  │        ▼
  │   [React Frontend]
  │   ├─ Product Browsing
  │   ├─ User Auth
  │   ├─ Admin Panel
  │   └─ Shopping Cart
  │        │
  │        │ API Requests (JSON)
  │        ▼
  │   [Express API Server]
  │   ├─ Authentication Routes
  │   ├─ Product Routes
  │   ├─ Sales Routes
  │   ├─ User Routes
  │   └─ Security Middleware
  │        │
  │        │ Data Operations
  │        ▼
  │   [MongoDB Database]
  │   ├─ Users
  │   ├─ Products (Items)
  │   ├─ Categories
  │   ├─ Brands
  │   └─ Sales
  │
  └─→ [External Services]
       ├─ Cloudinary (Images)
       ├─ Gmail (Emails)
       ├─ Google OAuth
       └─ Facebook OAuth
```

### Data Flow

1. **User Interacts with UI** → React component
2. **React Component Calls API** → Axios HTTP request
3. **Backend Receives Request** → Express route handler
4. **Middleware Processing** → Authentication, validation, security
5. **Business Logic** → Controller executes operation
6. **Database Operation** → Mongoose query
7. **Response Sent** → JSON response to frontend
8. **UI Updates** → React renders new data

## Complete Installation Guide

### Step 1: Clone the Repository

```bash
# Clone from Git
git clone https://github.com/yourusername/boseth-traders.git
cd boseth-traders

# Or if you have the files locally
cd C:\Users\yasho\Downloads\boseth-traders
```

### Step 2: Setup External Services

Before running the application, configure these services:

#### 2.1 MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (free tier M0)
4. Wait 3-5 minutes for cluster to initialize
5. Click "Connect" and select "Drivers"
6. Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/bosethtraders?retryWrites=true&w=majority
   ```

#### 2.2 Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy: **Cloud Name**, **API Key**, **API Secret**
4. Create folder named `boseth-traders` for uploads

#### 2.3 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Boseth Traders"
3. Enable OAuth 2.0 consent screen
4. Create OAuth 2.0 credentials (Web application):
   - Authorized JavaScript origins: `http://localhost:3000`, `http://localhost:5000`
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Copy **Client ID** and **Client Secret**

#### 2.4 Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Select "Consumer" app type
4. Add "Facebook Login" product
5. Configure settings:
   - Valid OAuth Redirect URIs: `http://localhost:5000/api/auth/facebook/callback`
6. Copy **App ID** and **App Secret**

#### 2.5 Gmail Setup

1. Use your existing Gmail account
2. Enable 2-factor authentication (if not enabled)
3. Generate app password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy generated 16-character password

### Step 3: Backend Installation & Configuration

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
# Windows PowerShell
New-Item -Name ".env" -ItemType "file"

# macOS/Linux
touch .env
```

#### Configure `.env` file for Server

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database - Use MongoDB URI from Step 2.1
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bosethtraders?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=Qm9zZXRoVHJhZGVycz0xMjM0NXdYX2p3dF9zM2NyM3QxXzI5JkRldjI=
JWT_EXPIRE=7d

# Cloudinary Configuration - From Step 2.2
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Frontend URL
CLIENT_URL=http://localhost:3000

# Google OAuth - From Step 2.3
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Facebook OAuth - From Step 2.4
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Email Configuration - From Step 2.5
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

#### Initialize Database

```bash
# Create collections and seed initial data
npm run init-db

# Expected output:
# ✅ Database initialized successfully
# ✅ Sample data inserted
```

#### Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Expected output:
# ✅ Database connected successfully
# ✅ Server running on port 5000

# API available at: http://localhost:5000/api
```

### Step 4: Frontend Installation & Configuration

```bash
# Navigate to client directory (in new terminal)
cd ../client

# Install dependencies
npm install

# Create .env file
# Windows PowerShell
New-Item -Name ".env" -ItemType "file"

# macOS/Linux
touch .env
```

#### Configure `.env` file for Client

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# OAuth - From Step 2.3
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# OAuth - From Step 2.4
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
```

#### Start Frontend Development Server

```bash
# Start development server
npm run dev

# Expected output:
# VITE v7.1.2  ready in 245 ms
#
# ➜  Local:   http://localhost:5173/

# Open browser and navigate to http://localhost:5173
```

## Running the Platform

### Start All Services

You'll need **3 terminal windows**:

**Terminal 1 - Backend Server:**

```bash
cd server
npm run dev
# Output: ✅ Server running on port 5000
```

**Terminal 2 - Frontend Server:**

```bash
cd client
npm run dev
# Output: ➜ Local: http://localhost:5173
```

**Terminal 3 - For running commands (optional)**

```bash
# Available for running scripts or testing
```

### Access the Platform

- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Testing:** Use Postman to test endpoints

### First Time Usage

1. Go to [http://localhost:5173](http://localhost:5173)
2. Click "Register" to create an account
3. Complete registration with email
4. Login with your credentials
5. Browse products
6. For admin features:
   - Create admin user in MongoDB directly OR
   - Contact system administrator

## Platform Features

### User Features

#### Authentication

- ✅ Email/Password registration
- ✅ Secure login with JWT tokens
- ✅ Google OAuth single sign-on
- ✅ Facebook OAuth single sign-on
- ✅ Forgot password recovery
- ✅ Email verification
- ✅ Session management

#### Shopping

- ✅ Browse products with categories
- ✅ Filter by brand and price range
- ✅ Search functionality
- ✅ View detailed product information
- ✅ Product image gallery
- ✅ Add to cart
- ✅ Persistent shopping cart (localStorage)
- ✅ Checkout process

#### User Account

- ✅ View profile information
- ✅ Edit profile details
- ✅ Change password
- ✅ Order history
- ✅ Download invoices
- ✅ Account settings

### Admin Features

#### Product Management

- ✅ Add new products
- ✅ Edit product details
- ✅ Upload product images (Cloudinary)
- ✅ Manage categories
- ✅ Manage brands
- ✅ Delete products
- ✅ Inventory tracking

#### Sales Management

- ✅ View all sales transactions
- ✅ Track sales by date range
- ✅ Sales analytics and charts
- ✅ Revenue reporting
- ✅ Export sales data

#### User Management

- ✅ View all users
- ✅ User details and history
- ✅ Manage user roles
- ✅ User activity tracking

## Environment Configuration

### Complete Environment Variables Reference

#### Backend (.env)

```env
# === Server Configuration ===
NODE_ENV=development              # development or production
PORT=5000                         # Server port

# === Database ===
MONGODB_URI=mongodb+srv://username:password@cluster...

# === Authentication ===
JWT_SECRET=your_secret_key        # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_EXPIRE=7d                      # Token expiration

# === Image Upload ===
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# === URLs ===
CLIENT_URL=http://localhost:3000

# === OAuth Google ===
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# === OAuth Facebook ===
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx

# === Email ===
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=app_password
```

#### Frontend (.env)

```env
# === API Configuration ===
VITE_API_BASE_URL=http://localhost:5000/api

# === OAuth ===
VITE_GOOGLE_CLIENT_ID=xxx
VITE_FACEBOOK_APP_ID=xxx
```

## Common Workflows

### Workflow 1: Development & Testing

```bash
# 1. Start backend
cd server && npm run dev

# 2. Start frontend (new terminal)
cd client && npm run dev

# 3. Test API (Postman)
GET http://localhost:5000/api/items

# 4. Test frontend
Navigate to http://localhost:5173

# 5. Make code changes
# Hot reload automatically applies changes

# 6. Run linting
npm run lint

# 7. Fix linting issues
npm run lint -- --fix
```

### Workflow 2: Database Management

```bash
# Initialize/reset database
cd server
npm run init-db

# Connect directly to MongoDB
# Use MongoDB Compass
# Connection: mongodb+srv://username:password@cluster...

# View database in browser
# MongoDB Atlas Dashboard
```

### Workflow 3: Adding New Feature (Product Feature Example)

1. **Design the feature** - Plan data structure
2. **Create API endpoint** - Backend route
3. **Create UI component** - React component
4. **Connect frontend to backend** - API calls
5. **Test thoroughly** - Manual and automated
6. **Deploy** - Push to production

### Workflow 4: Debugging

```bash
# 1. Check browser console
F12 → Console tab → Look for errors

# 2. Check network requests
F12 → Network tab → API requests

# 3. Check backend logs
Terminal where you ran: npm run dev

# 4. Check database
MongoDB Compass or Atlas Dashboard

# 5. Use VS Code Debugger
Launch with F5 (configured in launch.json)
```

## Troubleshooting

### Issue: "Cannot find module" error

**Cause:** Dependencies not installed

**Solution:**

```bash
# Reinstall dependencies
npm install

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

### Issue: MongoDB connection fails

**Cause:** Wrong URI, network issues, or MongoDB not running

**Solution:**

```bash
# 1. Verify MongoDB Atlas is running
# 2. Check URI in .env
# 3. Add your IP to MongoDB Atlas Network Access
# 4. Test connection
node -e "const m = require('mongoose'); m.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.log(e))"
```

### Issue: "Port already in use"

**Solution:**

```bash
# Windows PowerShell - Find process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### Issue: CORS errors in browser

**Error:** `Access to XMLHttpRequest from origin 'http://localhost:3000' has been blocked`

**Solution:**

1. Verify `CLIENT_URL` in backend `.env`
2. Check CORS is enabled in Express
3. Restart both servers

### Issue: OAuth not working

**Solution:**

1. Verify OAuth credentials are correct in `.env`
2. Check redirect URIs match exactly
3. Test on localhost (127.0.0.1 won't work)
4. Check browser console for errors
5. Verify OAuth provider credentials

### Issue: Images not uploading

**Solution:**

1. Verify Cloudinary credentials in `.env`
2. Check file size (max 5MB)
3. Verify file type (jpg, png, gif, webp)
4. Test upload endpoint with Postman

### Issue: Emails not sending

**Solution:**

1. Use app password, not regular Gmail password
2. Verify EMAIL_USER and EMAIL_PASS in `.env`
3. Enable 2FA on Gmail account
4. Generate new app password

### Issue: Frontend shows blank page

**Solution:**

1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify API URL in `.env`
5. Clear browser cache

### Issue: Hot reload not working

**Solution:**

```bash
# Restart dev server
npm run dev

# If still not working
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Deployment

### Deploy Backend to Production

#### Option 1: Heroku (Recommended for beginners)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create boseth-traders-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_uri
heroku config:set JWT_SECRET=your_secret
# ... set other variables

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option 2: Railway

1. Sign up at [Railway](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Auto-deploy on push

#### Option 3: AWS/Azure/GCP

Use their respective services (EC2, App Service, Compute Engine)

### Deploy Frontend to Production

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel

# Follow prompts
```

#### Option 2: Netlify

```bash
# Build production bundle
npm run build

# Connect GitHub and auto-deploy
# Or drag-drop dist/ folder to Netlify
```

#### Option 3: Traditional Server

```bash
# Build
npm run build

# Upload dist/ folder to server
# Configure server to serve index.html
```

### Production Checklist

- [ ] Set `NODE_ENV=production` on backend
- [ ] Use production MongoDB URI
- [ ] Generate strong JWT_SECRET
- [ ] Set all OAuth credentials
- [ ] Configure Cloudinary
- [ ] Set up email service
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring/logging
- [ ] Create backups
- [ ] Test all features on production
- [ ] Set up SSL certificate
- [ ] Configure CDN for static files
- [ ] Enable rate limiting
- [ ] Set up error tracking (Sentry)

## Project Structure Overview

```
boseth-traders/
│
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context API
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # CSS files
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Express Backend
│   ├── controllers/          # Route handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── index.js
│
└── README.md                 # This file
```

## Getting Help

### Resources

- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Vite Guide](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Debugging Tools

- **Browser DevTools** - F12 in any browser
- **VS Code Debugger** - Built-in debugging
- **Postman** - API testing
- **MongoDB Compass** - Database exploration
- **Network tab** - Monitor API calls

### Support Channels

1. Check the README files for each service:

   - [Client README](./client/README.md)
   - [Server README](./server/README.md)

2. Review the troubleshooting sections

3. Check error logs and console messages

4. Verify environment configuration

## Contributing

To contribute to Boseth Traders:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

## License

This project is licensed under the ISC License.

## Version Information

- **Platform Version:** 1.0.0
- **Last Updated:** January 2026
- **Node Version:** 16.x or higher
- **npm Version:** 8.x or higher

## Quick Reference

### Commands Summary

```bash
# Backend
cd server
npm install                    # Install dependencies
npm run dev                   # Start development server
npm run init-db              # Initialize database
npm start                    # Start production server

# Frontend
cd ../client
npm install                  # Install dependencies
npm run dev                  # Start development server
npm run build                # Build for production
npm run preview              # Preview production build
npm run lint                 # Check code quality
```

### URLs

| Service     | URL                       | Purpose       |
| ----------- | ------------------------- | ------------- |
| Frontend    | http://localhost:5173     | Web interface |
| Backend API | http://localhost:5000/api | REST API      |
| MongoDB     | mongodb+srv://...         | Database      |
| Cloudinary  | https://cloudinary.com    | Image hosting |

### Important Files

| File                   | Purpose                     |
| ---------------------- | --------------------------- |
| `/server/.env`         | Backend environment config  |
| `/client/.env`         | Frontend environment config |
| `/server/index.js`     | Express server entry point  |
| `/client/src/main.jsx` | React app entry point       |
| `/server/models/`      | Database schemas            |
| `/client/src/App.jsx`  | Root React component        |

---

## Final Notes

- Always keep `.env` files in `.gitignore` for security
- Never commit sensitive credentials
- Test thoroughly before deploying
- Monitor logs for errors in production
- Keep dependencies updated regularly
- Use strong passwords and JW secrets
- Implement rate limiting in production
- Enable HTTPS/SSL in production
- Regular database backups
- Monitor API performance

---

**For detailed setup of individual components:**

- See [Client Setup Guide](./client/README.md) for frontend details
- See [Server Setup Guide](./server/README.md) for backend details

**Created:** January 2026  
**Platform:** Boseth Traders v1.0.0  
**Status:** Ready for Development & Deployment
