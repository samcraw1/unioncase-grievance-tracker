# UnionCase Deployment Roadmap

## Current Status: Demo-Ready ✓

Your app is ready for demonstration with:
- Local development environment running
- Test accounts created and verified
- 10 sample grievances loaded
- iOS Simulator compatible
- Mobile-responsive design working

**Test Credentials:**
- **Steward**: steward@nalc.org / password123
- **Representative**: rep@nalc.org / password123
- **Employee**: employee@nalc.org / password123

---

## Phase 1: Demo (Current Phase)

### What You Have
- ✓ React + Vite PWA frontend
- ✓ Express.js backend API
- ✓ PostgreSQL database (local)
- ✓ Authentication system with JWT
- ✓ Desktop sidebar navigation
- ✓ Mobile bottom navigation
- ✓ Resources page with USPS handbooks
- ✓ GitHub repository created

### Access Points
- Desktop/Mobile Browser: `http://192.168.1.61:5173`
- iOS Simulator: `http://localhost:5173`
- Localhost: `http://localhost:5173`

**No domain or hosting needed yet** - Save your money until after the demo!

---

## Phase 2: Post-Demo Deployment Plan

### Timeline Overview (4-5 Weeks)

#### Week 1: Decision & Domain
- Get feedback from demo
- Decide if moving forward with deployment
- **Purchase domain** (~$10-15/year)
  - Suggested names: `unioncase.app`, `unioncase.com`, `nalcgrievance.com`, `grievancetracker.io`
  - Recommended providers: Cloudflare (~$10/year), Namecheap (~$12/year)

#### Week 2-3: Pre-Deployment Improvements
Focus on making the app production-ready:

1. **Environment Variables Setup**
   - Move all secrets to `.env` files
   - Configure production vs development environments
   - Update CORS settings for production domain

2. **Password Reset Flow**
   - Add "Forgot Password" link on login page
   - Email-based password reset tokens
   - Secure token expiration (15-30 minutes)

3. **Email Notifications**
   - Notify stewards when grievances assigned
   - Deadline reminders (24-48 hours before)
   - Status change notifications
   - Setup: SendGrid or Mailgun (free tier initially)

4. **Security Hardening**
   - Rate limiting on login/registration endpoints
   - Input validation and sanitization
   - Secure cookie settings (httpOnly, secure, sameSite)
   - HTTPS enforcement
   - SQL injection prevention (already using parameterized queries)
   - XSS protection

5. **Error Handling**
   - User-friendly error messages
   - Error logging service (Sentry free tier)
   - Graceful failure handling
   - Better loading states

6. **User Management Features**
   - Admin dashboard to manage users
   - Ability to activate/deactivate accounts
   - User role management
   - Bulk user import (CSV)

7. **Database Improvements**
   - Database migration system (e.g., knex migrations)
   - Automated backups
   - Connection pooling optimization
   - Indexes on frequently queried fields

#### Week 4: Deployment
Set up hosting and deploy the application:

1. **Choose Hosting Provider** (see options below)
2. **Set up Production Database**
3. **Deploy Backend API**
4. **Deploy Frontend**
5. **Connect Custom Domain**
6. **Configure SSL/HTTPS** (usually automatic)
7. **Set Environment Variables**

#### Week 5: Testing & Beta Launch
- Test all features in production
- Invite beta users (5-10 stewards)
- Monitor performance and errors
- Fix bugs as they arise
- Gather feedback for improvements

---

## Hosting Options & Costs

### Option A: Vercel + Railway (Recommended - Simplest)

**Frontend (Vercel):**
- Cost: **FREE**
- Features: Automatic deployments from GitHub, CDN, SSL
- Perfect for React/Vite apps
- Easy custom domain setup

**Backend + Database (Railway):**
- Cost: **$20-25/month**
- Includes: Node.js backend + PostgreSQL database
- Features: Automatic deployments, environment variables, monitoring
- 512MB RAM, 1GB storage included

**Total: ~$20-25/month**

**Pros:**
- Easiest to set up
- Excellent developer experience
- Free frontend hosting
- All-in-one backend solution

**Cons:**
- Slightly more expensive than Option B
- Split between two platforms

---

### Option B: Render (Most Affordable)

**All services on one platform:**
- Frontend (Static Site): **FREE**
- Backend (Web Service): **$7/month** (Starter plan)
- PostgreSQL Database: **$7/month** (Starter plan)

**Total: ~$14/month**

**Pros:**
- Most affordable option
- Everything in one place
- Easy management
- Good free tier for frontend

**Cons:**
- Services spin down after inactivity on free/starter tiers (may cause slow cold starts)
- Less feature-rich than Railway

---

### Option C: DigitalOcean App Platform

**Full Stack App:**
- Cost: **$12-20/month**
- Includes: Frontend, Backend, Database
- 512MB RAM, Basic resources

**Total: ~$12-20/month**

**Pros:**
- All-in-one solution
- More control and customization
- Established provider

**Cons:**
- Slightly more complex setup
- Less automated than Vercel/Railway

---

### Comparison Table

| Solution | Monthly Cost | Setup Difficulty | Best For |
|----------|--------------|------------------|----------|
| **Vercel + Railway** | $20-25 | Easy | Best developer experience, rapid deployment |
| **Render** | $14 | Easy | Budget-conscious, simplicity |
| **DigitalOcean** | $12-20 | Medium | More control, established infrastructure |

---

## Additional Services & Costs

### Email Service (For Notifications)
**SendGrid:**
- Free tier: 100 emails/day (3,000/month)
- Paid: $19.95/month for 50,000 emails/month

**Mailgun:**
- Free tier: First 1,000 emails/month
- Paid: $35/month for 50,000 emails/month

**Recommendation:** Start with free tier, upgrade as needed

### Error Monitoring
**Sentry:**
- Free tier: 5,000 errors/month
- Sufficient for initial deployment
- Upgrade to $26/month if needed

### Total Monthly Budget Estimate

**Minimum (Render + Free Tiers):**
- Hosting: $14
- Email: $0 (free tier)
- Monitoring: $0 (free tier)
- **Total: $14/month**

**Recommended (Railway + SendGrid):**
- Hosting: $20-25
- Email: $0-20 (start free)
- Monitoring: $0 (Sentry free tier)
- **Total: $20-45/month**

**Fits perfectly in your $20-50/month budget!**

---

## Domain Purchase Guide

### When to Buy
**After successful demo** - Don't purchase until you're committed to deploying.

### Domain Name Suggestions
1. `unioncase.app` - Modern, app-focused
2. `unioncase.com` - Professional, traditional
3. `nalcgrievance.com` - Descriptive, organization-focused
4. `grievancetracker.io` - Tech-focused, clear purpose

### Where to Buy
1. **Cloudflare** (~$10/year) - Cheapest, great DNS management
2. **Namecheap** (~$12/year) - User-friendly, good support
3. **Google Domains/Squarespace** (~$12/year) - Simple, reliable

### DNS Configuration
Once purchased, you'll need to:
1. Point domain to hosting provider
2. Configure DNS records (A/CNAME records)
3. Enable SSL certificate (usually automatic)
4. Wait for DNS propagation (up to 48 hours)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

### Code & Configuration
- [ ] All secrets moved to environment variables
- [ ] Production-ready `.env.example` file created
- [ ] CORS configured for production domain
- [ ] Database connection string for production
- [ ] JWT secret changed from development value
- [ ] API rate limiting implemented

### Features
- [ ] Password reset functionality
- [ ] Email notification system
- [ ] Error logging setup
- [ ] User management admin panel
- [ ] Input validation on all forms
- [ ] Loading states for all async operations

### Security
- [ ] HTTPS enforced
- [ ] Secure cookie settings
- [ ] SQL injection prevention verified
- [ ] XSS protection implemented
- [ ] CSRF protection (if needed)
- [ ] Rate limiting on sensitive endpoints

### Database
- [ ] Migration system in place
- [ ] Backup strategy defined
- [ ] Production database created
- [ ] Initial data seeded (if needed)
- [ ] Database indexes optimized

### Testing
- [ ] All features tested locally
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed
- [ ] PWA installation tested
- [ ] Offline functionality verified (if applicable)

### Documentation
- [ ] README updated with production setup
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment process documented

---

## Deployment Steps (When Ready)

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Set Up Hosting Account
1. Sign up for chosen hosting provider
2. Connect GitHub repository
3. Select branch to deploy (usually `main`)

### Step 3: Configure Environment Variables
Set these in your hosting dashboard:
```
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Server
PORT=5001
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>

# Frontend
VITE_API_URL=https://api.yourdomain.com

# Email (if using SendGrid)
SENDGRID_API_KEY=<your-key>
FROM_EMAIL=noreply@yourdomain.com

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Step 4: Deploy Database
1. Create PostgreSQL instance on hosting provider
2. Note connection string
3. Run migrations to create tables
4. Optionally seed initial data

### Step 5: Deploy Backend
1. Set environment variables
2. Configure build command: `npm install && npm run build` (if needed)
3. Configure start command: `npm start` or `node src/index.js`
4. Deploy and verify health check

### Step 6: Deploy Frontend
1. Set `VITE_API_URL` to backend URL
2. Configure build command: `npm install && npm run build`
3. Set output directory: `dist`
4. Deploy and verify

### Step 7: Connect Domain
1. Add custom domain in hosting dashboard
2. Update DNS records at domain provider
3. Wait for SSL certificate provisioning (automatic)
4. Verify HTTPS is working

### Step 8: Final Testing
- [ ] Test login functionality
- [ ] Create a test grievance
- [ ] Test all CRUD operations
- [ ] Verify email notifications (if enabled)
- [ ] Test on mobile devices
- [ ] Check PWA installation
- [ ] Monitor error logs

---

## Post-Deployment Tasks

### Immediate (Day 1)
- Monitor error logs for any issues
- Test all critical user flows
- Verify email delivery
- Check database connections
- Ensure HTTPS is working

### Week 1
- Invite beta users (5-10 stewards)
- Gather initial feedback
- Monitor performance metrics
- Fix any critical bugs
- Document known issues

### Ongoing
- Weekly backup verification
- Monthly security updates
- Monitor hosting costs
- Review error logs
- Implement user feedback
- Plan feature additions

---

## Future Enhancements (After Stable Deployment)

### Phase 3: Feature Expansion
1. **Document Upload & Storage**
   - Cloud storage integration (AWS S3, Cloudflare R2)
   - PDF viewer in app
   - Document version history

2. **Advanced Reporting**
   - Grievance analytics dashboard
   - Win/loss rate tracking
   - Time-to-resolution metrics
   - Export to Excel/CSV

3. **Mobile Apps**
   - iOS native app (optional, PWA works well)
   - Android native app (optional)
   - Push notifications

4. **Collaboration Features**
   - Comments on grievances
   - @mentions for team members
   - Real-time updates (WebSockets)
   - Activity feed

5. **Integration**
   - Calendar integration (Google Calendar, Outlook)
   - Slack/Teams notifications
   - USPS systems integration (if available)

6. **Multi-Tenant (SaaS Conversion)**
   - Organization management
   - Billing/subscription system
   - Custom branding per organization
   - Usage analytics

---

## What NOT to Do Yet

- ❌ Don't buy domain before demo
- ❌ Don't sign up for hosting services yet
- ❌ Don't set up production database yet
- ❌ Don't worry about scaling/performance yet
- ❌ Don't implement every feature before launching
- ❌ Don't optimize prematurely

---

## Need Help?

When you're ready to deploy, come back with:
1. Demo results and feedback
2. Chosen hosting option
3. Any specific requirements that came up
4. Questions about the deployment process

**For now: Focus on nailing that demo!** You're already set up perfectly.

---

## Quick Reference

### Current Project Structure
```
USPS Grivanance App/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   │   └── handbooks/     # USPS PDF files
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── index.js       # Main server file
│   │   ├── config/        # DB config, seed data
│   │   └── routes/        # API routes
│   └── package.json
└── .gitignore

GitHub Repo: https://github.com/samcraw1/unioncase-grievance-tracker
```

### Useful Commands
```bash
# Start development servers
cd "/Users/sam/USPS Grivanance App/server" && npm run dev
cd "/Users/sam/USPS Grivanance App/client" && npm run dev

# Database operations
PGPASSWORD="sammyandanna09" psql -U sammycrawford -d grievance_tracker

# Git operations
git status
git add .
git commit -m "message"
git push origin main
```

### Tech Stack Summary
- **Frontend**: React 18, Vite, TailwindCSS, React Router v7
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa

---

*Last Updated: 2025-11-22*
