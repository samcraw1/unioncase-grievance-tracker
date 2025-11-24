# USPS Grievance Tracker - Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Backend Deployment (Railway)](#backend-deployment-railway)
6. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Domain Setup](#domain-setup)
9. [SSL/HTTPS Configuration](#sslhttps-configuration)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The USPS Grievance Tracker consists of two separate deployments:

- **Backend (API)**: Deployed on Railway with PostgreSQL database
- **Frontend (React)**: Deployed on Vercel as a static site

This guide provides step-by-step instructions for deploying both components.

### Architecture

```
[Users] → [Vercel (Frontend)] → [Railway (Backend API)] → [PostgreSQL Database]
```

---

## Prerequisites

Before starting deployment, ensure you have:

- [ ] Git repository with the codebase
- [ ] GitHub account (for connecting to deployment platforms)
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] Domain name (optional, for custom domain)
- [ ] SMTP credentials for email notifications (optional)

---

## Environment Variables

### Backend Environment Variables

Create these in Railway:

```env
# Database (automatically provided by Railway if using Railway PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
JWT_SECRET=your-secret-key-here-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=production
PORT=5001

# File Upload
MAX_FILE_SIZE=10485760

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=USPS Grievance Tracker <noreply@yourapp.com>

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend Environment Variables

Create these in Vercel:

```env
# API Configuration
VITE_API_URL=https://your-railway-app.railway.app/api

# Environment
VITE_ENV=production
```

---

## Database Setup

### Option 1: Railway PostgreSQL (Recommended)

1. **Create PostgreSQL Database in Railway**
   ```
   - Log into Railway dashboard
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Railway automatically provides DATABASE_URL
   ```

2. **Initialize Database Schema**
   ```bash
   # Connect to your Railway PostgreSQL
   psql $DATABASE_URL

   # Run the schema file
   \i server/src/config/schema.sql

   # Exit psql
   \q
   ```

3. **Seed Initial Data (Optional)**
   ```bash
   # Set DATABASE_URL environment variable locally
   export DATABASE_URL="your-railway-database-url"

   # Run seed script
   cd server
   npm run seed
   ```

### Option 2: External PostgreSQL

If using an external PostgreSQL provider:

1. **Create a new PostgreSQL database** (version 12 or higher)

2. **Configure connection**
   - Note the connection string
   - Ensure the database allows connections from Railway's IP addresses

3. **Run migrations**
   ```bash
   psql -h hostname -U username -d database -f server/src/config/schema.sql
   ```

### Database Migration Checklist

- [ ] Users table created
- [ ] Grievances table created
- [ ] Grievance_timeline table created
- [ ] Deadlines table created
- [ ] Documents table created
- [ ] Notes table created
- [ ] Notifications table created
- [ ] All indexes created
- [ ] All foreign keys configured
- [ ] Triggers set up for updated_at columns

---

## Backend Deployment (Railway)

### Step 1: Create Railway Project

1. **Go to Railway.app**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected

2. **Select Repository**
   - Choose your USPS Grievance Tracker repository
   - Railway will detect it's a Node.js project

### Step 2: Configure Build Settings

1. **Set Root Directory**
   ```
   Root Directory: server
   ```

2. **Build Command** (usually auto-detected)
   ```
   npm install
   ```

3. **Start Command**
   ```
   npm start
   ```

### Step 3: Add PostgreSQL Database

1. **In Railway Dashboard**
   - Click "+ New" in your project
   - Select "Database" → "PostgreSQL"
   - Railway will create and link the database

2. **Connect Database to Service**
   - Railway automatically adds DATABASE_URL to your service
   - Verify in Variables tab

### Step 4: Configure Environment Variables

1. **Go to your service's Variables tab**

2. **Add Required Variables**
   ```
   JWT_SECRET=generate-a-long-random-string-here
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=5001
   MAX_FILE_SIZE=10485760
   ```

3. **Generate JWT_SECRET**
   ```bash
   # Run this locally to generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Add Email Variables** (if using email notifications)
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-specific-password
   EMAIL_FROM=USPS Grievance Tracker <noreply@yourapp.com>
   ```

### Step 5: Configure Uploads Directory

Railway needs persistent storage for file uploads:

1. **Add Volume** (Railway Volumes feature)
   - Go to Settings → Volumes
   - Add a volume mounted at `/app/uploads`

   OR

2. **Use Cloud Storage** (Recommended for production)
   - Integrate AWS S3, Google Cloud Storage, or similar
   - Modify file upload logic in `server/src/routes/documents.js`

### Step 6: Initialize Database

1. **Get Railway Database Connection String**
   ```bash
   # In Railway dashboard, go to PostgreSQL service
   # Copy the DATABASE_URL
   ```

2. **Run Schema Locally**
   ```bash
   # Set the DATABASE_URL
   export DATABASE_URL="your-railway-database-url"

   # Run schema
   psql $DATABASE_URL -f server/src/config/schema.sql
   ```

   OR

3. **Use Railway CLI**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli

   # Login
   railway login

   # Link to project
   railway link

   # Run migration
   railway run psql $DATABASE_URL -f server/src/config/schema.sql
   ```

### Step 7: Deploy

1. **Trigger Deployment**
   - Railway automatically deploys on git push to main branch
   - Or click "Deploy" in Railway dashboard

2. **Monitor Deployment**
   - Watch the build logs
   - Ensure no errors occur
   - Wait for "Build successful" message

3. **Verify Deployment**
   - Click on the deployment URL (e.g., `https://your-app.up.railway.app`)
   - Test: `https://your-app.up.railway.app/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

### Step 8: Configure Domain (Optional)

1. **Generate Domain**
   - Railway provides a default domain
   - Or add custom domain in Settings → Domains

2. **Note the API URL**
   - You'll need this for frontend configuration
   - Example: `https://your-app.up.railway.app`

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. **Go to Vercel.com**
   - Click "New Project"
   - Import your GitHub repository

2. **Select Framework**
   - Vercel should auto-detect Vite
   - Framework Preset: Vite

### Step 2: Configure Build Settings

1. **Root Directory**
   ```
   client
   ```

2. **Build Command**
   ```
   npm run build
   ```

3. **Output Directory**
   ```
   dist
   ```

4. **Install Command**
   ```
   npm install
   ```

### Step 3: Environment Variables

1. **Add Environment Variables**
   - Go to Settings → Environment Variables

2. **Add Required Variables**
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app/api
   VITE_ENV=production
   ```

   **Important**: Replace `your-railway-app.up.railway.app` with your actual Railway backend URL

### Step 4: Deploy

1. **Click "Deploy"**
   - Vercel will build and deploy automatically
   - Monitor build logs for errors

2. **Wait for Deployment**
   - Usually takes 1-2 minutes
   - Vercel provides a preview URL

3. **Verify Deployment**
   - Click "Visit" to open your deployed app
   - Try logging in or registering
   - Check browser console for errors

### Step 5: Configure Domain (Optional)

1. **Add Custom Domain**
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - HTTPS is enabled by default

---

## Post-Deployment Configuration

### Update Backend CORS

1. **Update CORS in Railway**
   - Add environment variable:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

2. **Or modify `server/src/index.js`** if needed
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || true,
     credentials: true
   }));
   ```

### Test End-to-End

1. **Create Test Account**
   - Register a new user
   - Verify email is correctly formatted

2. **Test Grievance Creation**
   - File a test grievance
   - Verify it saves correctly
   - Check database for the record

3. **Test File Upload**
   - Upload a test document
   - Verify it's accessible
   - Check storage location

4. **Test PDF Export**
   - Export a grievance to PDF
   - Verify PDF generates correctly

### Configure Email Notifications

1. **Set up SMTP in Railway**
   - Add SMTP variables (shown above)

2. **Test Email Sending**
   - Trigger a notification
   - Verify email is received
   - Check spam folder if not received

3. **For Gmail**
   - Use App Password (not regular password)
   - Enable 2FA on account
   - Generate App Password in Google Account settings

---

## Domain Setup

### Custom Domain Configuration

#### For Frontend (Vercel)

1. **Add Domain in Vercel**
   - Go to your project → Settings → Domains
   - Enter your domain (e.g., `grievance.yourunion.org`)
   - Follow DNS instructions

2. **Configure DNS**
   - Add CNAME record:
     ```
     CNAME  grievance  cname.vercel-dns.com
     ```
   - Or A record to Vercel's IP

3. **Wait for Propagation**
   - DNS changes can take up to 48 hours
   - Usually completes in 1-2 hours

#### For Backend (Railway)

1. **Add Custom Domain**
   - Go to Railway project → Settings → Domains
   - Click "Add Domain"
   - Enter your API subdomain (e.g., `api.grievance.yourunion.org`)

2. **Configure DNS**
   - Add CNAME record provided by Railway
   - Example:
     ```
     CNAME  api  your-app.up.railway.app
     ```

3. **Update Frontend Environment Variable**
   ```
   VITE_API_URL=https://api.grievance.yourunion.org/api
   ```

---

## SSL/HTTPS Configuration

### Automatic SSL

Both Vercel and Railway provide automatic SSL:

- **Vercel**: Automatically provisions Let's Encrypt certificates
- **Railway**: Automatically provisions SSL for custom domains

### Verify HTTPS

1. **Check Certificate**
   - Visit your domain
   - Click padlock icon in browser
   - Verify certificate is valid

2. **Test API over HTTPS**
   ```bash
   curl https://your-api-domain.com/api/health
   ```

### Force HTTPS

Frontend automatically redirects HTTP to HTTPS. For backend, Railway handles this by default.

---

## Monitoring and Maintenance

### Railway Monitoring

1. **View Logs**
   - Go to Railway dashboard
   - Click on your service
   - View "Logs" tab for real-time logs

2. **Metrics**
   - Monitor CPU and memory usage
   - Check request counts
   - View response times

3. **Set Up Alerts**
   - Configure alerts for downtime
   - Set up error notifications

### Vercel Monitoring

1. **Analytics**
   - View page visits and performance
   - Check Core Web Vitals

2. **Deployment Logs**
   - Review build logs
   - Check for build warnings

### Database Maintenance

1. **Backups**
   - Railway automatically backs up PostgreSQL
   - Set up additional backup schedule if needed

2. **Database Monitoring**
   - Check connection counts
   - Monitor query performance
   - Review slow queries

3. **Manual Backup**
   ```bash
   # Backup database
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

### Regular Maintenance Tasks

**Weekly:**
- [ ] Review error logs
- [ ] Check system performance
- [ ] Verify backups are working

**Monthly:**
- [ ] Review user feedback
- [ ] Update dependencies
- [ ] Check for security updates
- [ ] Review database size and performance

**Quarterly:**
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Review and update documentation

---

## Troubleshooting

### Common Deployment Issues

#### Backend Won't Start

**Symptom**: Railway deployment fails or crashes immediately

**Solutions**:
1. Check build logs for errors
2. Verify all environment variables are set
3. Ensure DATABASE_URL is correct
4. Check that Node.js version is compatible
5. Verify package.json scripts are correct

```bash
# Test locally with production environment
NODE_ENV=production npm start
```

#### Database Connection Fails

**Symptom**: "Failed to connect to database" errors

**Solutions**:
1. Verify DATABASE_URL format
   ```
   postgresql://user:password@host:port/database
   ```
2. Check database is running (Railway PostgreSQL status)
3. Verify firewall rules allow connections
4. Test connection string locally:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

#### Frontend Can't Connect to Backend

**Symptom**: API requests fail, CORS errors in browser console

**Solutions**:
1. Verify VITE_API_URL is correct in Vercel
2. Check backend is running (visit /api/health)
3. Verify CORS configuration in backend
4. Check browser console for specific errors
5. Test API with curl:
   ```bash
   curl https://your-api.railway.app/api/health
   ```

#### File Uploads Fail

**Symptom**: Documents won't upload or disappear after deployment

**Solutions**:
1. Verify uploads directory exists and is writable
2. Check Railway volume is mounted correctly
3. Verify MAX_FILE_SIZE environment variable
4. Check file type is allowed
5. Consider moving to cloud storage (S3, etc.)

#### Email Notifications Not Sending

**Symptom**: No emails received

**Solutions**:
1. Verify SMTP credentials are correct
2. Check spam folder
3. Test SMTP connection:
   ```bash
   # Install test tool
   npm install -g smtp-test-server

   # Test SMTP
   node -e "require('nodemailer').createTransport({host:'smtp.gmail.com',port:587,auth:{user:'email',pass:'password'}}).verify((e,s)=>console.log(e||'Success'))"
   ```
4. For Gmail, use App Password
5. Check email service isn't blocking automated emails

#### Build Failures

**Symptom**: Vercel or Railway build fails

**Solutions**:
1. Check for syntax errors in code
2. Verify all dependencies are in package.json
3. Check Node version compatibility
4. Review build logs for specific errors
5. Test build locally:
   ```bash
   # Frontend
   cd client && npm run build

   # Backend
   cd server && npm install
   ```

### Performance Issues

#### Slow API Responses

**Solutions**:
1. Add database indexes (check schema.sql)
2. Optimize queries (use EXPLAIN ANALYZE)
3. Add caching layer (Redis)
4. Scale Railway service (upgrade plan)
5. Review and optimize slow endpoints

#### High Memory Usage

**Solutions**:
1. Check for memory leaks
2. Optimize file upload handling
3. Limit query result sizes
4. Add pagination to all list endpoints
5. Scale Railway service resources

### Debugging Tools

**View Backend Logs:**
```bash
# Using Railway CLI
railway logs

# Or in Railway dashboard
```

**View Frontend Logs:**
- Check Vercel dashboard → Deployment logs
- Use browser developer console

**Database Debugging:**
```bash
# Connect to Railway PostgreSQL
railway run psql $DATABASE_URL

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

---

## Rollback Procedures

### Rolling Back Backend Deployment

1. **In Railway Dashboard**
   - Go to Deployments tab
   - Find previous successful deployment
   - Click "Redeploy"

2. **Or via Git**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push
   ```

### Rolling Back Frontend Deployment

1. **In Vercel Dashboard**
   - Go to Deployments
   - Find previous deployment
   - Click "..." → "Promote to Production"

### Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD.sql

# Or use Railway backup restore feature
```

---

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection enabled
- [ ] File upload restrictions enforced
- [ ] Environment variables are not committed to git
- [ ] Database backups are automated
- [ ] Error messages don't leak sensitive info
- [ ] Authentication tokens expire appropriately

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 1 second
- CPU usage > 80%
- Memory usage > 85%
- Database connection pool exhausted
- Error rate increasing

### Scaling Options

1. **Vertical Scaling** (Railway)
   - Upgrade to higher-tier plan
   - Increase memory and CPU

2. **Horizontal Scaling**
   - Add more Railway instances
   - Use load balancer
   - Implement session management (Redis)

3. **Database Scaling**
   - Add read replicas
   - Implement connection pooling
   - Optimize queries and indexes

4. **CDN for Frontend**
   - Vercel includes CDN
   - Consider additional CDN for assets

---

## Support and Resources

- **Railway Documentation**: https://docs.railway.app
- **Vercel Documentation**: https://vercel.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Project Repository**: [Your GitHub Repo]
- **Issue Tracker**: [Your GitHub Issues]

---

## Deployment Checklist

Use this checklist for each deployment:

### Pre-Deployment
- [ ] Code reviewed and tested locally
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database migrations prepared
- [ ] Backup created

### Backend Deployment
- [ ] Railway project created
- [ ] PostgreSQL database provisioned
- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] Service deployed successfully
- [ ] Health check endpoint responding
- [ ] API endpoints tested

### Frontend Deployment
- [ ] Vercel project created
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Site deployed successfully
- [ ] Can access application
- [ ] Can register/login
- [ ] Can create grievance
- [ ] API connection working

### Post-Deployment
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates active
- [ ] Email notifications tested
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Backup verification
- [ ] Documentation updated
- [ ] Team notified

---

**Deployment complete!** Your USPS Grievance Tracker is now live and ready to use.
