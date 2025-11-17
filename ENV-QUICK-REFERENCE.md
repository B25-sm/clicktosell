# Quick Reference: Environment Setup

**Copy this file to your clipboard and refer to it while setting up!**

---

## 🔐 JWT SECRETS

```bash
cd to project root
node scripts/generate-secrets.js
```
**Copy all 4 secrets!**

---

## 🗄️ MONGODB ATLAS

```
https://cloud.mongodb.com
→ Sign up / Login
→ Create cluster (Free M0)
→ Database Access → Add user → Save password!
→ Network Access → Allow all IPs
→ Connect → Connect app → Copy string
→ Replace <password> with actual password
```

**Result:** `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority`

---

## 💾 REDIS

```
https://redis.com/try-free/
→ Sign up
→ New Subscription → Fixed (Free)
→ Create database → Copy endpoint
```

**Result:** `redis://default:password@host:port`

---

## 💳 RAZORPAY

```
https://razorpay.com
→ Sign up
→ Dashboard → Settings → API Keys
→ Generate Test Keys
→ Copy Key ID and Secret
```

**Result:** 
- Key ID: `rzp_test_...`
- Secret: `xxxxx...`

---

## 📦 AWS S3

```
https://aws.amazon.com
→ Create account
→ Search "S3" → Create bucket
→ Name: olx-classifieds-images
→ Uncheck "Block all public access"
→ Create bucket
→ Permissions → CORS → Paste CORS config
→ IAM → Users → Create user
→ Attach policy: S3FullAccess
→ Create access key → Copy keys
```

**Result:**
- Access Key: `AKIA...`
- Secret: `xxxxx...`
- Region: `ap-south-1`
- Bucket: `olx-classifieds-images`

---

## 📧 GMAIL

```
https://myaccount.google.com
→ Security → 2-Step Verification → Enable
→ App passwords → Generate for "Mail"
→ Copy 16-char password
```

**Result:** `abcdefghijklmnop`

---

## 🗺️ GOOGLE MAPS (Optional)

```
https://console.cloud.google.com
→ New Project
→ APIs → Enable: Maps, Geocoding, Places
→ Credentials → Create API Key
→ Copy key
```

**Result:** `AIzaSy...`

---

## 📱 TWILIO (Optional)

```
https://www.twilio.com/try-twilio
→ Sign up
→ Dashboard → Copy Account SID & Auth Token
→ Buy phone number
```

**Result:**
- SID: `AC...`
- Token: `xxxxx...`
- Number: `+1234567890`

---

## 📝 CREATE BACKEND .ENV

```bash
cd backend
cp env.example .env
# OR (Windows)
Copy-Item env.example .env
```

**Open .env and fill:**

```env
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=paste_from_step_1
JWT_REFRESH_SECRET=paste_from_step_1
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=paste_from_step_6
RAZORPAY_KEY_ID=paste_from_step_4
RAZORPAY_KEY_SECRET=paste_from_step_4
AWS_ACCESS_KEY_ID=paste_from_step_5
AWS_SECRET_ACCESS_KEY=paste_from_step_5
AWS_REGION=ap-south-1
AWS_S3_BUCKET=olx-classifieds-images
```

---

## 🎨 CREATE FRONTEND .ENV.LOCAL

```bash
cd frontend-web
touch .env.local
# OR (Windows)
New-Item .env.local -ItemType File
```

**Open .env.local and add:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=paste_razorpay_key_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=paste_from_step_7
```

---

## ✅ TEST

```bash
cd backend && npm run dev
# Should see: MongoDB Connected, Redis Connected

cd frontend-web && npm run dev
# Open http://localhost:3000
```

---

**Done! 🚀**


