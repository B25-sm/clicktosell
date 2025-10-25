# OLX Classifieds - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- [Vercel account](https://vercel.com) (free tier available)
- GitHub repository with your code
- Node.js 16+ installed locally

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)
1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project Settings:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend-web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

3. **Environment Variables:**
   Add these in Vercel dashboard → Project Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app
   NODE_ENV=production
   ```

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: olx-classifieds
# - Directory: frontend-web
# - Override settings? No
```

### 3. Current Configuration

Your project is already configured with:
- ✅ **vercel.json** - Proper monorepo configuration
- ✅ **package.json** - Correct build scripts
- ✅ **Next.js 14** - Latest framework
- ✅ **Tailwind CSS** - Styled components
- ✅ **TypeScript** - Type safety

### 4. Environment Variables Setup

In Vercel Dashboard → Project Settings → Environment Variables, add:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app

# Production Settings
NODE_ENV=production

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### 5. Build Configuration

The project uses these build settings:
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node.js Version:** 18.x

### 6. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate will be automatically provisioned

### 7. Performance Optimization

Your deployment includes:
- ✅ **Image Optimization** - Next.js automatic optimization
- ✅ **Static Generation** - Pre-rendered pages
- ✅ **Edge Functions** - Global CDN
- ✅ **Compression** - Automatic gzip/brotli
- ✅ **Caching** - Intelligent caching strategies

### 8. Monitoring & Analytics

- **Vercel Analytics** - Built-in performance monitoring
- **Real User Monitoring** - User experience metrics
- **Core Web Vitals** - Performance scores
- **Error Tracking** - Automatic error detection

### 9. Troubleshooting

#### Common Issues:

1. **Build Fails:**
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all dependencies are in package.json
   npm install --production
   ```

2. **Environment Variables Not Working:**
   ```bash
   # Restart deployment after adding env vars
   # Check variable names match exactly
   ```

3. **API Calls Failing:**
   ```bash
   # Verify NEXT_PUBLIC_API_URL is set
   # Check CORS settings on backend
   ```

4. **Styling Issues:**
   ```bash
   # Ensure Tailwind CSS is properly configured
   # Check for missing CSS imports
   ```

### 10. Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] Environment variables configured
- [ ] Build command working locally
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Performance monitoring set up

### 11. Post-Deployment

After successful deployment:

1. **Test the website:**
   - Visit your Vercel URL
   - Check all pages load correctly
   - Test responsive design
   - Verify API connections

2. **Set up monitoring:**
   - Enable Vercel Analytics
   - Configure error tracking
   - Set up performance alerts

3. **Optimize performance:**
   - Check Core Web Vitals
   - Optimize images
   - Enable caching

### 12. Production URLs

After deployment, you'll get:
- **Website:** `https://your-project.vercel.app`
- **Admin Panel:** `https://your-project-admin.vercel.app` (if deployed separately)
- **API:** `https://your-backend-api.vercel.app` (if backend is deployed)

### 13. Support

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)
- **Community Support:** [github.com/vercel/next.js](https://github.com/vercel/next.js)

---

## 🎉 Success!

Your OLX Classifieds website is now live and ready for users!

**Next Steps:**
1. Test all functionality
2. Set up backend API deployment
3. Configure database connections
4. Enable user authentication
5. Add real data and content

**Performance Tips:**
- Use Vercel's Edge Functions for global performance
- Enable Image Optimization for faster loading
- Set up proper caching strategies
- Monitor Core Web Vitals regularly



