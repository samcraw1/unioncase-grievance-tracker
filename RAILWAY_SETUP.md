# Railway Deployment Setup

## Database Configuration

**IMPORTANT:** Use the correct DATABASE_URL in Railway!

### In Railway Dashboard:

1. Go to your **PostgreSQL service**
2. Click on **Variables** tab
3. You'll see multiple database URLs:

- `DATABASE_URL` - **USE THIS ONE** ✅
  - Example: `postgresql://postgres:xxxxx@roundhouse.proxy.rlwy.net:12345/railway`
  - This uses Railway's proxy network and works across all services

- `DATABASE_PRIVATE_URL` - **DO NOT USE** ❌
  - Example: `postgresql://postgres:xxxxx@postgres.railway.internal:5432/railway`
  - This only works if services are on the same private network
  - Will cause `ENOTFOUND postgres.railway.internal` errors

### Setting up your Web Service:

1. Go to your **web service** (unioncase-grievance-tracker)
2. Go to **Variables** tab
3. Click **Shared Variable** button
4. Select `DATABASE_URL` from your Postgres service
5. **Make sure it references the PUBLIC DATABASE_URL, not the PRIVATE one**

### Current Issue:

If you're seeing `ENOTFOUND postgres.railway.internal` errors, you're using the wrong DATABASE_URL.

**Fix:** Update your web service's DATABASE_URL to use the public one from the Postgres service.
