# 🚀 Vercel Monorepo 404 Fix - Complete Guide

## ❌ Root Causes Identified

1. **Incorrect `vercel.json`**: Using legacy `builds` API and wrong routing
2. **Output Directory Override**: Specifying `.next` directory manually (Vercel handles this)
3. **Missing Framework Detection**: Not letting Vercel auto-detect Next.js properly
4. **Incomplete `.vercelignore`**: Not properly excluding other monorepo folders

---

## ✅ Step-by-Step Fix

### 1️⃣ Understanding the Issue

The 404 error occurred because:
- Vercel was trying to build from root instead of `frontend-web`
- The legacy `builds` configuration was conflicting with auto-detection
- Routing rules were pointing to `/frontend-web/$1` which doesn't exist in deployment
- Next.js wasn't detected properly due to incorrect configuration

### 2️⃣ Updated Files

#### ✅ Fixed `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "cd frontend-web && npm install && npm run build",
  "installCommand": "cd frontend-web && npm install",
  "framework": "nextjs"
}
```

**Key changes:**
- ❌ Removed `outputDirectory` (Vercel handles this automatically)
- ❌ Removed `builds` array (legacy API)
- ❌ Removed `routes` array (not needed for Next.js)
- ✅ Added explicit `buildCommand` to target `frontend-web`
- ✅ Added `framework: "nextjs"` for proper detection
- ✅ Clean, minimal configuration

#### ✅ Fixed `.vercelignore`
```
# Ignore everything except frontend-web
*
!frontend-web/
!package.json
!vercel.json
!node_modules/

# Specifically ignore these directories
app/
backend/
mobile-app/
admin-panel/
olx-classifieds/
scripts/
gradle/
nginx/

# Ignore build artifacts and logs
*.log
logs/
build/
.next/
dist/

# Ignore environment files
.env
.env.local
.env.*.local
*.env

# Ignore documentation
*.md
!README.md
```

### 3️⃣ Verified Route Structure

The app uses **Next.js App Router** with:
```
frontend-web/src/app/page.tsx  ✅ Valid home route
frontend-web/src/app/layout.tsx  ✅ Root layout
```

---

## 🧩 Correct Vercel Configuration

### In `vercel.json` (at root):
```json
{
  "version": 2,
  "buildCommand": "cd frontend-web && npm install && npm run build",
  "installCommand": "cd frontend-web && npm install",
  "framework": "nextjs"
}
```

### Why This Works:
1. **`buildCommand`**: Explicitly runs build inside `frontend-web` folder
2. **`installCommand`**: Installs dependencies in the correct location
3. **`framework: "nextjs"`**: Tells Vercel to use Next.js optimizations
4. **No outputDirectory**: Vercel automatically finds `.next` folder
5. **No manual routing**: Next.js handles routing automatically

---

## ⚙️ Correct Vercel Dashboard Settings

Go to: **Project Settings → General**

### ✅ Recommended Settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | (Leave empty) |
| **Build Command** | `cd frontend-web && npm install && npm run build` |
| **Output Directory** | (Leave empty - let Vercel detect) |
| **Install Command** | `cd frontend-web && npm install` |
| **Development Command** | `cd frontend-web && npm run dev` |
| **Framework Preset** | Next.js |

**Important Notes:**
- ⚠️ **DON'T** set Output Directory to `.next` or `frontend-web/.next`
- ⚠️ **DON'T** set Root Directory to `frontend-web` (this breaks detection)
- ✅ Let Vercel auto-detect the Next.js framework
- ✅ Use explicit build/install commands that cd into `frontend-web`

### Alternative: Use Project Context

If dashboard shows "Cannot auto-detect framework":

1. Go to **Settings → General → Root Directory**
2. Click "Browse" and select `frontend-web` folder
3. Vercel will auto-detect Next.js from `frontend-web/package.json`
4. Leave Build/Output settings as defaults

**Then in `vercel.json`, you can simplify to:**
```json
{
  "version": 2
}
```

---

## 🪄 Expected Successful Log Output

### ✅ Correct Build Log (You Should See):

```bash
=== Cloning repo ===
Cloning from GitHub...

=== Installing Dependencies ===
Running "cd frontend-web && npm install"
npm WARN deprecated... (ignore these)
added 1205 packages in 15s

=== Building Application ===
Running "cd frontend-web && npm run build"
> next build

✔ Compiled successfully

Creating an optimized production build
Compiled successfully

Linting and checking validity of types
Generating static pages (0/10) [===================>] 100%
Generating dynamic routes (0/2) [===================>] 100%

Route (app)                              Size     First Load JS
┌ ● /                                     5.2 kB     132.5 kB
└ ○ /test                                 2.8 kB     130.1 kB

● (SSG) Static pages
○ (Static) Static routes

=== Deploying ===
Uploading: 100%
Lambda functions created: 0
Serverless functions created: 0
Initializing...

✔ Deployment complete

✓ Ready in 45s
```

### ✅ Routes You Should See:

```
Route (app):
  ● / (SSG)           → Homepage
  ○ /test (Static)    → Test page
```

### ❌ What You Were Seeing (Before Fix):

```
Route (app):
  ○ /404 (Static)     → Only 404 page
```

---

## 🔧 Additional Troubleshooting

### If you still get 404:

1. **Check Environment Variables:**
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   ```

2. **Clear Vercel Cache:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Select "Redeploy"

3. **Verify Build Output:**
   ```
   Look for: "Generating static pages (10/10) ✓"
   NOT: "Generating static pages (0/10)" ❌
   ```

4. **Check Next.js Version:**
   ```json
   // frontend-web/package.json
   "next": "^14.0.0"  // Should be 13+ for App Router
   ```

### Common Issues:

| Issue | Cause | Fix |
|-------|-------|-----|
| "Only 404 page" | Building from root | Add `cd frontend-web` to buildCommand |
| "Framework not detected" | No `package.json` at root | Install deps in `frontend-web` |
| "Build failed" | Missing dependencies | Check installCommand |
| "Routes not found" | OutputDirectory override | Remove from vercel.json |

---

## 📋 Quick Checklist

Before deploying, ensure:

- [x] `vercel.json` uses minimal config (no outputDirectory)
- [x] `.vercelignore` excludes all folders except `frontend-web`
- [x] `frontend-web/src/app/page.tsx` exists
- [x] Build command uses `cd frontend-web`
- [x] Dashboard settings leave Output Directory empty
- [x] Environment variables are set in Vercel dashboard
- [x] Next.js version is 13+ (for App Router support)

---

## 🎯 Summary

The fix required:
1. ✅ Removing `outputDirectory` override from `vercel.json`
2. ✅ Using explicit build commands that cd into `frontend-web`
3. ✅ Letting Vercel auto-detect Next.js framework
4. ✅ Keeping configuration minimal and clean

**Result:** Vercel now correctly builds the Next.js app from `frontend-web` folder and serves all routes properly.
