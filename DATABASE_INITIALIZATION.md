# Database Initialization Guide

## Overview

This guide walks you through setting up the PostgreSQL database for the UnionCase Grievance Tracker application. This includes initializing the schema, configuring environment variables, and creating test accounts for development.

## Prerequisites

- Railway account with PostgreSQL database provisioned
- Access to Railway dashboard
- PostgreSQL client (psql) installed locally (optional, for verification)

## Railway Database Configuration

### 1. Access Database Credentials

1. Navigate to your Railway project dashboard
2. Click on the **PostgreSQL** service/plugin
3. Go to the **Variables** tab
4. Copy the following connection details:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
   - `DATABASE_URL` (full connection string)

### 2. Configure Backend Environment Variables

In your Railway **backend service** (not the PostgreSQL service):

1. Click on your backend service
2. Go to the **Variables** tab
3. Add the following environment variables:

```bash
DATABASE_URL=<copy from PostgreSQL service>
JWT_SECRET=<generate a random 64-character string>
NODE_ENV=production
CLIENT_URL=<your Vercel frontend URL when deployed>
PORT=3000
```

**To generate a secure JWT_SECRET**:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64
```

### 3. Initialize Database Schema

You have two options depending on whether you have an existing database with data:

#### Option A: Fresh Database (Recommended for New Deployments)

Use the main schema file that includes all the latest union system features:

1. Navigate to Railway PostgreSQL service
2. Click on the **Data** tab
3. Click **Query** to open the SQL console
4. Copy the contents of `server/src/config/schema.sql`
5. Paste into the query console and execute

**Or using psql locally**:
```bash
psql $DATABASE_URL -f server/src/config/schema.sql
```

#### Option B: Existing Database Migration

If you have existing data from before the union system update:

1. First, backup your existing data:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

2. Run the migration script:
```bash
psql $DATABASE_URL -f server/src/config/migrate_union_system.sql
```

This will:
- Add the `union_type` column to the users table
- Migrate existing craft values to new format
- Update all database constraints
- Preserve all existing data

### 4. Verify Schema Installation

Run the following queries to verify the schema is correctly installed:

```sql
-- Check that tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify users table structure
\d users

-- Verify grievances table structure
\d grievances

-- Check constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass;
```

Expected tables:
- `users`
- `grievances`
- `comments`
- `documents`

## Test Accounts

### Seeding Test Data

The `server/src/config/seed.sql` file contains test accounts for development and testing.

**To seed test accounts**:
```bash
psql $DATABASE_URL -f server/src/config/seed.sql
```

### Test Account Credentials

Use these accounts to test the application:

#### Employee Account
- **Email**: `employee@test.com`
- **Password**: `password123`
- **Role**: Employee
- **Union**: NALC (City Carrier)
- **Use for**: Filing grievances, viewing own grievances

#### Union Steward Account
- **Email**: `steward@test.com`
- **Password**: `password123`
- **Role**: Union Steward
- **Union**: NALC (City Carrier)
- **Use for**: Managing grievances, adding comments, updating statuses

#### Union Representative Account
- **Email**: `rep@test.com`
- **Password**: `password123`
- **Role**: Union Representative
- **Union**: APWU (Clerk)
- **Use for**: Full system access, managing all grievances, generating reports

### Verifying Test Accounts

After seeding, verify accounts were created:

```sql
-- List all users
SELECT email, first_name, last_name, role, craft, union_type
FROM users
ORDER BY role;

-- Check specific test account
SELECT * FROM users WHERE email = 'employee@test.com';
```

## Database Maintenance

### Backup Strategy

**Automated Backups** (Railway):
- Railway automatically backs up PostgreSQL databases
- Backups are retained based on your Railway plan
- Access backups via Railway dashboard → PostgreSQL service → Backups tab

**Manual Backup**:
```bash
# Full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only
pg_dump $DATABASE_URL --schema-only > schema_backup.sql

# Data only
pg_dump $DATABASE_URL --data-only > data_backup.sql
```

### Restore from Backup

```bash
# Restore full backup
psql $DATABASE_URL < backup_20251123_120000.sql

# Restore specific table
pg_restore -d $DATABASE_URL -t users backup_file.sql
```

### Common Maintenance Queries

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Check table sizes
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name)))
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

-- Check number of records per table
SELECT
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'grievances', COUNT(*) FROM grievances
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'documents', COUNT(*) FROM documents;

-- Check recent grievances
SELECT id, grievance_number, status, created_at
FROM grievances
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to database
**Solution**:
1. Verify `DATABASE_URL` is correctly set in Railway backend service
2. Check PostgreSQL service is running (Railway dashboard)
3. Verify network access (Railway handles this automatically)
4. Check for typos in connection string

### Schema Issues

**Problem**: Tables don't exist
**Solution**:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- If missing, run schema.sql again
```

**Problem**: Constraint violations when creating users
**Solution**:
```sql
-- Check constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass;

-- Verify craft values match constraints
SELECT DISTINCT craft FROM users;
```

### Migration Issues

**Problem**: Migration fails with existing data
**Solution**:
1. Create backup first
2. Check for invalid craft values in existing data:
```sql
SELECT * FROM users WHERE craft NOT IN (
  'city_carrier', 'cca', 'rural_carrier', 'rca',
  'clerk', 'maintenance', 'mvs', 'other'
);
```
3. Update invalid values before running migration
4. Re-run migration script

### Test Account Issues

**Problem**: Cannot log in with test accounts
**Solution**:
1. Verify accounts exist:
```sql
SELECT email, role FROM users WHERE email LIKE '%test.com';
```
2. If missing, run seed.sql again
3. Check password hashing is working (should start with `$2a$` or `$2b$`)

**Problem**: Test accounts have NULL union_type
**Solution**:
```sql
-- Update union_type based on craft
UPDATE users
SET union_type = CASE
  WHEN craft IN ('city_carrier', 'cca') THEN 'nalc'
  WHEN craft IN ('rural_carrier', 'rca') THEN 'nrlca'
  WHEN craft IN ('clerk', 'maintenance', 'mvs') THEN 'apwu'
  ELSE NULL
END
WHERE union_type IS NULL;
```

## Production Considerations

### Before Going Live

1. **Remove Test Accounts**:
```sql
DELETE FROM users WHERE email LIKE '%test.com';
```

2. **Create Admin Account**: Register a real admin account through the UI

3. **Set Strong JWT Secret**: Generate a new 64-character secret for production

4. **Enable SSL**: Ensure `DATABASE_URL` uses SSL (Railway handles this by default)

5. **Configure Backups**: Verify Railway backup schedule is appropriate

6. **Set Appropriate Environment**:
```bash
NODE_ENV=production
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Remove test accounts
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable SSL for database connections
- [ ] Restrict database access to backend service only
- [ ] Regular backup schedule configured
- [ ] Monitor database size and performance
- [ ] Set up error logging and monitoring

## Next Steps

After initializing the database:

1. **Test Backend Connection**: Verify backend can connect to database
2. **Register Real Users**: Create actual user accounts via registration page
3. **Test Grievance Flow**: File a test grievance through the UI
4. **Deploy Frontend**: Deploy client to Vercel with `VITE_API_URL` pointing to Railway backend
5. **End-to-End Testing**: Test complete workflow from login → file grievance → add comments

## Support Resources

- **Railway Documentation**: https://docs.railway.app/databases/postgresql
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **UnionCase Documentation**: See `UNION_SYSTEM.md` for union configuration details

---

**Last Updated**: 2025-11-23
**Version**: 1.0
**Status**: Production Ready
