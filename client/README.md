# Boseth Traders - Client Setup Guide

This is the frontend application for the Boseth Traders e-commerce platform built with React, Vite, and Tailwind CSS.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Build & Deployment](#build--deployment)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 16.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Code Editor**: VS Code or any preferred IDE

## Project Overview

Boseth Traders Client is a modern React-based frontend that provides:
- User authentication (Login, Register, Password Recovery)
- Product browsing and filtering
- Product detail pages
- Shopping cart and checkout
- Admin dashboard for inventory management
- Sales tracking and reporting
- User profile management

## Installation

### Step 1: Clone or Navigate to the Repository

```bash
# If cloning from a repository
git clone <repository-url>
cd boseth-traders/client

# Or if already in the client folder
cd client
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will read the `package.json` file and install:
- **React** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **Recharts** - Data visualization library
- And other development dependencies

## Environment Setup

### Step 3: Create Environment File

Create a `.env` file in the client root directory:

```bash
touch .env
```

### Step 4: Configure Environment Variables

Add the following variables to your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

**Variable Explanations:**

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API endpoint | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID (get from Google Cloud Console) | `xxxxx.apps.googleusercontent.com` |
| `VITE_FACEBOOK_APP_ID` | Facebook App ID (get from Facebook Developers) | `123456789012345` |

**How to get OAuth Credentials:**

1. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable OAuth 2.0
   - Create credentials (OAuth 2.0 Client ID)
   - Add localhost URIs: `http://localhost:3000`

2. **Facebook OAuth:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create an app
   - Configure Facebook Login
   - Add localhost: `http://localhost:3000`

## Running the Application

### Step 5: Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v7.1.2  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

The application will be available at `http://localhost:5173/` by default (port may vary).

### Step 6: Access the Application

- Open your browser and navigate to the URL shown in the terminal
- The page will hot-reload whenever you make changes to the code
- Open Developer Tools (F12) to check for any errors

## Build & Deployment

### Production Build

Create an optimized production build:

```bash
npm run build
```

This will:
- Minify and optimize all code
- Generate optimized bundles
- Output files to the `dist/` directory
- Reduce bundle size by ~70%

### Preview Production Build Locally

Before deploying, test the production build:

```bash
npm run preview
```

This serves the production build locally for testing.

### Deployment Options

**Deploy to Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Deploy to Netlify:**
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

**Deploy to Traditional Server:**
```bash
# Copy dist folder contents to your server
scp -r dist/* user@server:/var/www/boseth-traders/
```

## Project Structure

```
client/
├── public/                 # Static assets (images, favicons)
│   └── images/            # Public images folder
├── src/
│   ├── App.jsx            # Root application component
│   ├── main.jsx           # Application entry point
│   ├── index.css          # Global styles
│   ├── App.css            # App-specific styles
│   ├── assets/            # Project assets
│   ├── components/        # Reusable React components
│   │   ├── AdminRoute.jsx         # Protected route for admins
│   │   ├── PrivateRoute.jsx       # Protected route for users
│   │   ├── Navbar.jsx            # Navigation component
│   │   ├── FilterSidebar.jsx     # Product filter sidebar
│   │   ├── ProductCard.jsx       # Product card display
│   │   ├── ProductList.jsx       # Product listing
│   │   ├── SalesEntryModal.jsx   # Sales entry modal
│   │   └── admin/
│   │       └── ItemModal.jsx     # Admin item management modal
│   ├── context/           # React Context for state management
│   │   ├── AuthContext.jsx       # Authentication context
│   │   └── ItemContext.jsx       # Items/Products context
│   ├── pages/             # Page components
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Registration page
│   │   ├── ForgotPassword.jsx    # Password recovery
│   │   ├── ResetPassword.jsx     # Password reset
│   │   ├── Home.jsx              # Homepage
│   │   ├── Products.jsx          # Products listing page
│   │   ├── ProductDetail.jsx     # Single product details
│   │   ├── Profile.jsx           # User profile page
│   │   ├── About.jsx             # About page
│   │   └── admin/
│   │       ├── Dashboard.jsx     # Admin dashboard
│   │       ├── Items.jsx         # Admin items management
│   │       └── Sales.jsx         # Admin sales tracking
│   ├── utils/
│   │   └── api.js                # Axios instance and API calls
│   ├── hooks/             # Custom React hooks
│   └── styles/            # Additional stylesheets
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── index.html            # HTML entry point
```

## Key Features

### Authentication
- User registration with email validation
- Secure login with JWT tokens
- Google OAuth integration
- Facebook OAuth integration
- Password recovery and reset functionality
- Automatic logout on token expiration

### Product Management
- Browse all products with pagination
- Filter products by category and brand
- Search functionality
- Detailed product information
- Product image gallery

### Shopping Cart
- Add/remove items from cart
- Update quantities
- Persistent cart (localStorage)
- Total price calculation

### Admin Features
- Dashboard with sales analytics
- Add, edit, delete products
- Manage inventory
- Track sales
- View customer orders

### User Features
- View order history
- Update profile information
- Change password
- Wishlist functionality

## Technology Stack

### Frontend Framework
- **React 19.1** - UI library
- **Vite 7.1** - Build tool and dev server (⚡ Lightning fast)

### Routing & State
- **React Router DOM 7.8** - Client-side routing
- **React Context** - State management

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS 8.5** - CSS transformations
- **Autoprefixer** - Browser compatibility

### HTTP & API
- **Axios 1.11** - Promise-based HTTP client
- Auto request/response interceptors
- Built-in error handling

### UI/UX
- **Lucide React** - Icon library (500+ icons)
- **Framer Motion 12** - Advanced animations
- **Recharts 3.1** - Data visualization (charts & graphs)

### Development Tools
- **ESLint 9** - Code quality and style
- **React Refresh** - Fast refresh during development
- **Vite Plugin React** - Optimized React support

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/YourPage.jsx`:
```jsx
export default function YourPage() {
  return <div>Your Page Content</div>;
}
```

2. Add route in `src/App.jsx`:
```jsx
import YourPage from './pages/YourPage';

// Inside your routes
<Route path="/yourpage" element={<YourPage />} />
```

### Making API Calls

Use the axios instance from `src/utils/api.js`:

```jsx
import api from '../utils/api';

// GET request
const data = await api.get('/items');

// POST request
const response = await api.post('/sales', { data });

// Error handling
try {
  const data = await api.get('/items');
} catch (error) {
  console.error(error.response?.data?.message);
}
```

### Using Context

```jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function MyComponent() {
  const { user, logout } = useContext(AuthContext);
  return <div>{user?.email}</div>;
}
```

### Linting Code

Check for code issues:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint -- --fix
```

## Troubleshooting

### Issue: Port 5173 already in use
**Solution:**
```bash
# Kill the process using the port
# On Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# On macOS/Linux
lsof -ti:5173 | xargs kill -9
```

### Issue: Modules not found after npm install
**Solution:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Environment variables not loading
**Solution:**
- Ensure `.env` file is in the root client directory
- Restart dev server after creating/modifying `.env`
- Use `VITE_` prefix for all client-side variables
- Check browser console for undefined values

### Issue: CORS errors when calling API
**Solution:**
- Verify `VITE_API_BASE_URL` matches backend URL
- Check backend CORS configuration allows localhost:5173
- Ensure backend server is running

### Issue: Styles not applying (Tailwind)
**Solution:**
```bash
# Clear Tailwind cache
rm -rf .tailwind-cache
npm run dev
```

### Issue: Blank page or white screen
**Solution:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify `.env` file variables are correct
5. Clear browser cache (Ctrl+Shift+Delete)

## Performance Tips

1. **Lazy load components:**
```jsx
import { lazy, Suspense } from 'react';
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

2. **Optimize images:** Use WebP format or compress with tools like TinyPNG

3. **Monitor bundle size:**
```bash
npm run build
# Check dist folder size
```

4. **Use React DevTools** - Browser extension for performance profiling

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/docs/intro)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the project structure
3. Check browser console for errors
4. Review backend logs for API issues

---

**Last Updated:** January 2026
**Version:** 1.0.0
