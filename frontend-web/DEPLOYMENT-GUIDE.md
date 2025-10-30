# Frontend Deployment Guide

## Environment Variable Fix for Render/Vercel

### The Problem
Your Next.js app is failing because the `NEXT_PUBLIC_API_URL` environment variable is not properly configured in your deployment platform.

### Solution

#### For Render Deployment:

1. **Create the missing secret in Render:**
   ```bash
   render secrets:create next_public_api_url https://clicktosell.onrender.com
   ```

2. **Deploy your app:**
   ```bash
   render deploy
   ```

#### For Vercel Deployment:

1. **Add environment variable in Vercel Dashboard:**
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add: `NEXT_PUBLIC_API_URL` = `https://clicktosell.onrender.com`

2. **Or use Vercel CLI:**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter: https://clicktosell.onrender.com
   ```

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Configuration Files Created

1. **`vercel.json`** - Vercel deployment configuration
2. **`render.yaml`** - Render deployment configuration  
3. **`.env.example`** - Environment variable template

### Current Backend URL
Your frontend is configured to use: `https://clicktosell.onrender.com`

### Testing the Fix

After deployment, verify the environment variable is working:

1. Check your app's network tab in browser dev tools
2. Look for API calls to the correct backend URL
3. Ensure no CORS errors

### Troubleshooting

If you still get errors:

1. **Check the exact error message** - it will tell you which variable is missing
2. **Verify the backend URL** - make sure `https://clicktosell.onrender.com` is accessible
3. **Clear build cache** - some platforms cache builds
4. **Check environment variable names** - they must match exactly (case-sensitive)

### Alternative Backend URLs

If your backend is deployed elsewhere, update the environment variable to:
- **Vercel Backend**: `https://your-app.vercel.app`
- **Railway**: `https://your-app.railway.app`
- **Heroku**: `https://your-app.herokuapp.com`
- **Local Development**: `http://localhost:5000`
