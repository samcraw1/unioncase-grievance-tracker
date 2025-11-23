# Production Deployment Guide - UnionCase

Quick reference guide for deploying to Vercel + Railway.

## Pre-Deployment Checklist

- [ ] All code committed to GitHub
- [ ] Environment variables documented in `.env.example` files
- [ ] Database schema exported (`server/src/config/schema.sql`)
- [ ] Test accounts working locally

## Step 1: Deploy Database & Backend (Railway)

### 1.1 Sign Up & Create Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy PostgreSQL"

### 1.2 Set Up PostgreSQL Database
1. Railway automatically provisions a Postgres database
2. Copy the `DATABASE_URL` from the database settings
3. Save it for later - you'll need it for the backend

### 1.3 Deploy Backend API
1. In Railway dashboard, click "New" → "GitHub Repo"
2. Select your `unioncase-grievance-tracker` repository
3. Railway will detect the Node.js app
4. Set Root Directory to `/server`
5. Click "Add Variables" and set:
   ```
   NODE_ENV=production
   DATABASE_URL=<from-postgres-service>
   JWT_SECRET=<generate-new-secret>
   CLIENT_URL=https://your-app.vercel.app
   PORT=5001
   ```

6. Generate new JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### 1.4 Initialize Database
1. Once backend is deployed, use Railway CLI or connect to database
2. Run the schema:
   ```bash
   # From your local terminal with Railway CLI installed
   railway run npm run db:init
   ```

3. Or manually connect and run `/server/src/config/schema.sql`

### 1.5 Get Backend URL
- Railway provides a URL like: `https://unioncase-api-production.up.railway.app`
- Copy this - you'll need it for the frontend

---

## Step 2: Deploy Frontend (Vercel)

### 2.1 Sign Up & Import Project
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Select `unioncase-grievance-tracker` repository

### 2.2 Configure Build Settings
1. **Root Directory**: `client`
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 2.3 Set Environment Variables
Click "Environment Variables" and add:
```
VITE_API_URL=https://your-railway-backend.up.railway.app/api
```

### 2.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Vercel provides URL like: `https://unioncase.vercel.app`

---

## Step 3: Update CORS Settings

### 3.1 Update Backend Environment Variables
Go back to Railway → Backend Service → Variables:

Update `CLIENT_URL` to include your Vercel URL:
```
CLIENT_URL=https://unioncase.vercel.app,https://unioncase-preview.vercel.app
```

(Include preview URLs if you want them to work)

### 3.2 Redeploy Backend
Railway will automatically redeploy with new environment variables.

---

## Step 4: Test Production Deployment

### 4.1 Test Backend API
```bash
curl https://your-railway-backend.up.railway.app/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

### 4.2 Test Frontend
1. Visit your Vercel URL
2. Try registering a new user
3. Log in
4. Create a test grievance

### 4.3 Create Admin/Test Accounts
Use curl or Postman to create accounts:

```bash
curl -X POST https://your-railway-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@unioncase.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "representative",
    "employeeId": "ADMIN001",
    "facility": "Main Office",
    "craft": "clerk"
  }'
```

---

## Step 5: Custom Domain (Optional)

### 5.1 Buy Domain
- Cloudflare (~$10/year)
- Namecheap (~$12/year)

### 5.2 Configure Vercel
1. Go to Vercel Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic, ~5 mins)

### 5.3 Update Backend CORS
Update Railway backend `CLIENT_URL`:
```
CLIENT_URL=https://unioncase.com,https://www.unioncase.com,https://unioncase.vercel.app
```

---

## Environment Variables Reference

### Backend (Railway)
```bash
NODE_ENV=production
DATABASE_URL=<railway-provides-this>
JWT_SECRET=<generate-with-crypto>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-app.vercel.app
PORT=5001
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-railway-backend.up.railway.app/api
```

---

## Monitoring & Maintenance

### Railway Dashboard
- View logs: Railway Dashboard → Service → Logs
- Monitor usage: Dashboard → Usage
- Database backups: Postgres Service → Backups

### Vercel Dashboard
- View deployments: Project → Deployments
- Monitor analytics: Project → Analytics
- View logs: Deployment → Function Logs

---

## Troubleshooting

### "CORS Error" in Browser Console
- Check `CLIENT_URL` in Railway includes your Vercel URL
- Verify no trailing slashes
- Redeploy backend after updating

### "Cannot connect to database"
- Verify `DATABASE_URL` is set in Railway
- Check database service is running
- Run `npm run db:init` if tables don't exist

### "API calls failing"
- Verify `VITE_API_URL` in Vercel matches Railway backend URL
- Check Railway backend is deployed and running
- Test `/api/health` endpoint

### Build Failures
**Vercel:**
- Check build logs in deployment
- Verify all dependencies in `package.json`
- Check Node version compatibility

**Railway:**
- Check deployment logs
- Verify environment variables are set
- Check for missing dependencies

---

## Cost Estimate

**Monthly Costs:**
- Railway (Backend + Database): $20-25/month
- Vercel (Frontend): FREE
- **Total: ~$20-25/month**

**One-time:**
- Domain: ~$10-15/year (optional)

---

## Next Steps After Deployment

1. Create initial user accounts for your team
2. Invite beta users to test
3. Monitor error logs for the first week
4. Set up database backups (Railway does this automatically)
5. Consider adding:
   - Email notifications (SendGrid/Mailgun)
   - Error monitoring (Sentry)
   - Analytics (Google Analytics/Plausible)

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## Security Reminders

- ✅ Never commit `.env` files
- ✅ Use strong JWT secrets in production
- ✅ Keep dependencies updated
- ✅ Monitor error logs for suspicious activity
- ✅ Enable 2FA on Railway and Vercel accounts
