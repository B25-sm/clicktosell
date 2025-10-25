# 🚀 Vercel Monorepo 404 Fix - Complete Guide

## ❌ Root Causes Identified

1. **DEPLOYMENT_NOT_FOUND**: Incorrect monorepo configuration causing Vercel to not detect the project properly
2. **Using `cd` commands**: Build commands with `cd` don't work well with Vercel's environment
3. **Missing Root Directory**: Need to explicitly tell Vercel where the Next.js app lives
4. **Incomplete `.vercelignore`**: Not properly excluding other monorepo folders

---

## ✅ Step-by-Step Fix

### 1️⃣ Understanding the Issue

The **DEPLOYMENT_NOT_FOUND** error occurred because:
- Vercel couldn't find the deployment because the build context was wrong
- Using `cd frontend-web && npm install` changes directory but doesn't change the project root for Vercel
- Vercel needs to know WHERE the Next.js project starts (its root)
- The deployment system couldn't map requests to the correct build output

### 2️⃣ Updated Files

#### ✅ Fixed `vercel.json` (CRITICAL FIX)
```json
{
  "buildCommand": "npm install && npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "projectSettings": {
    "rootDirectory": "frontend-web"
  }
}
```

**Key changes:**
- ❌ Removed `version: 2` (not needed anymore)
- ❌ Removed `cd frontend-web` from commands (doesn't work in Vercel)
- ✅ Added `projectSettings.rootDirectory` - **THIS IS THE KEY FIX**
- ✅ Simplified build commands (they run from `frontend-web` automatically)
- ✅ Clean, minimal configuration

**Why this works:**
- `rootDirectory` tells Vercel: "The Next.js project starts here"
- All commands run from `frontend-web` directory automatically
- No need for `cd` commands that confuse the build system

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

### 3️⃣ Vercel Dashboard Settings

Go to: **Project Settings → General**

### ✅ Recommended Settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend-web` |
| **Build Command** | (Leave empty - uses vercel.json) |
| **Output Directory** | (Leave empty - let Vercel detect) |
| **Install Command** | (Leave empty - uses vercel.json) |
| **Framework Preset** | Next.js |

**Important Notes:**
- ⚠️ **Set Root Directory to `frontend-web`** in dashboard
- ⚠️ **DON'T** override Output Directory
- ✅ Use `projectSettings.rootDirectory` in vercel.json
- ✅ Let Vercel handle everything else

---

## 🪄 Expected Successful Build Output

### ✅ Correct Build Log:

```bash
=== Installing Dependencies ===
Running npm install from frontend-web/
added 1205 packages in 15s

=== Building Application ===
Running npm run build from frontend-web/
> next build

✔ Compiled successfully

Route (app):                    Size
┌ ● /                          5.2 kB
└ ○ /test                      2.8 kB
```

---

## 🎯 Understanding the Concept

### Why DEPLOYMENT_NOT_FOUND?

Vercel's architecture requires:
1. **Project Root** - Where the Next.js `package.json` lives
2. **Build Context** - Where files are relative to
3. **Output Mapping** - Where `.next` folder gets created

**With `cd` commands:**
```
Root: /repo/
cd: /repo/frontend-web/
Build Output: /repo/frontend-web/.next
Mapping: ❌ Confused - is root /repo/ or /repo/frontend-web/?
```

**With `rootDirectory`:**
```
Root: /repo/frontend-web/ (explicitly set)
Build Output: /repo/frontend-web/.next
Mapping: ✅ Clear - root is /repo/frontend-web/
```

### Mental Model

Think of it like this:
- **Without rootDirectory**: You're trying to tell someone "go into the kitchen and cook" but they don't know which house.
- **With rootDirectory**: You're saying "the kitchen is at 123 Main St (rootDirectory). Now cook (build)."

---

## 🔍 Recognizing This Pattern

### Warning Signs:
- ✅ Using `cd` in build commands
- ✅ Building monorepo without setting root directory
- ✅ Multiple package.json files in different folders
- ✅ "Cannot auto-detect framework" errors

### Similar Mistakes:
- Using `cd` in Dockerfile FROM clauses
- Misconfiguring monorepo tooling (turborepo, nx)
- Not setting working directory in CI/CD

---

## 📋 Deployment Steps

1. **Commit the fixed vercel.json**
2. **Push to GitHub**
3. **In Vercel Dashboard → Settings → General**
   - Set **Root Directory** to `frontend-web`
4. **Redeploy** (or let auto-deploy happen)
5. **Check logs** for successful build

---

## 🎯 Summary

The fix:
1. ✅ Use `projectSettings.rootDirectory` instead of `cd` commands
2. ✅ Set Root Directory in dashboard too
3. ✅ Let Vercel handle Next.js detection automatically

**Result:** Vercel knows exactly where your Next.js app is and deploys it correctly! 🚀
