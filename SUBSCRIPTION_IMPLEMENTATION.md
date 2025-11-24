# Subscription & Trial Implementation Plan

## Overview
This document outlines the strategy for implementing a 60-day free trial for pilot users, followed by a paid monthly subscription model for the UnionCase grievance tracker app.

## Implementation Strategy

### Phase 1: Pilot Launch with Trial Tracking (Implement Now)

**Goal**: Launch with pilot users on a 60-day free trial with basic tracking

#### Database Changes Needed

Add the following fields to the `users` table:

```sql
ALTER TABLE users ADD COLUMN trial_starts_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP;
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'trial';
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'standard';
```

**Subscription Status Values:**
- `trial` - User is in free trial period
- `active` - Paid subscription is active
- `expired` - Trial ended, no payment
- `cancelled` - User cancelled subscription
- `past_due` - Payment failed

#### Backend Implementation

1. **Update Registration Logic** (`/server/src/routes/auth.js`)
   - Set `trial_starts_at` to current date
   - Set `trial_ends_at` to 60 days from registration
   - Set `subscription_status` to 'trial'

2. **Create Subscription Middleware** (`/server/src/middleware/subscription.js`)
   - Check if user's trial has expired
   - Block access to protected routes if subscription expired
   - Return appropriate error messages

3. **Add Subscription Endpoints** (`/server/src/routes/subscription.js`)
   - `GET /api/subscription/status` - Get current subscription status
   - `GET /api/subscription/trial-remaining` - Days remaining in trial
   - `POST /api/subscription/upgrade` - Placeholder for future Stripe integration

#### Frontend Implementation

1. **Trial Status Component** (`/client/src/components/SubscriptionBanner.jsx`)
   - Display days remaining in trial
   - Show "Upgrade" prompt as trial nears end
   - Display payment required message if trial expired

2. **Subscription Page** (`/client/src/pages/Subscription.jsx`)
   - Show current subscription status
   - Display trial end date
   - Pricing information
   - "Coming Soon" payment integration placeholder

3. **Access Control**
   - Redirect expired users to subscription page
   - Show trial status in header/sidebar
   - Prevent access to app features if expired

### Phase 2: Payment Integration (Implement ~Day 45 of Trial)

**Goal**: Add Stripe integration before pilot trials expire

#### Stripe Setup

1. **Create Stripe Account**
   - Sign up at stripe.com
   - Complete business verification
   - Set up bank account for payouts

2. **Configure Products & Pricing**
   - Create product: "UnionCase Monthly Subscription"
   - Set price: $X/month (determine your pricing)
   - Optional: Add yearly plan with discount

3. **Get API Keys**
   - Test keys for development
   - Production keys for live deployment

#### Backend Integration

1. **Install Stripe**
   ```bash
   cd server
   npm install stripe
   ```

2. **Environment Variables** (`.env`)
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

3. **Stripe Endpoints** (`/server/src/routes/stripe.js`)
   - `POST /api/stripe/create-checkout-session` - Start payment flow
   - `POST /api/stripe/create-portal-session` - Manage subscription
   - `POST /api/stripe/webhook` - Handle Stripe events
   - `GET /api/stripe/subscription-status` - Check payment status

4. **Webhook Handlers**
   - `checkout.session.completed` - Activate subscription
   - `customer.subscription.updated` - Update subscription status
   - `customer.subscription.deleted` - Handle cancellations
   - `invoice.payment_failed` - Handle failed payments

#### Frontend Integration

1. **Install Stripe**
   ```bash
   cd client
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

2. **Payment Flow**
   - Checkout page with Stripe Elements
   - Redirect to Stripe Checkout (easier option)
   - Success/cancel callback pages

3. **Subscription Management**
   - Link to Stripe Customer Portal
   - Display current plan and billing date
   - Allow cancellation/plan changes

### Phase 3: Migration of Pilot Users (Day 55-60)

**Goal**: Smoothly transition pilot users to paid subscriptions

#### Migration Strategy

1. **Email Campaign** (Starting Day 45)
   - Day 45: "15 days left in your trial"
   - Day 55: "5 days left - special pilot user pricing?"
   - Day 60: "Trial ending today - subscribe to keep access"
   - Day 61: "Your trial has ended"

2. **Discount Codes for Pilot Users** (Optional)
   ```
   - First month free for pilot users
   - 20% lifetime discount
   - Annual plan at special rate
   ```

3. **Manual Migration Process**
   - Create Stripe customer for each pilot user
   - Send personalized upgrade links
   - Extend trials if needed for special cases

4. **Database Migration**
   ```sql
   -- Update pilot users who subscribe
   UPDATE users
   SET subscription_status = 'active',
       subscription_tier = 'standard',
       stripe_customer_id = 'cus_xxxxx'
   WHERE email = 'pilot@example.com';
   ```

## Pricing Considerations

### Factors to Consider:
- **Cost per user**: Railway DB + Vercel hosting ÷ number of users
- **Development time**: Your time investment
- **Market research**: What do similar tools charge?
- **Value proposition**: Time saved, grievances won, etc.

### Suggested Pricing Models:

**Option 1: Per-User Pricing**
- $10-15/month per steward
- $30-50/month for local union (unlimited users)

**Option 2: Tiered Pricing**
- Basic: $20/month (1-5 users, basic features)
- Standard: $50/month (6-20 users, all features)
- Enterprise: $100/month (unlimited users, priority support)

**Option 3: Per-Local Pricing**
- Flat rate per local union: $75-150/month
- Based on local size (members count)

## Technical Requirements

### Database Schema

```sql
-- Full subscription tracking schema
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'trial',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  amount INTEGER, -- in cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Environment Variables Checklist

**Development** (`.env`)
```bash
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Subscription Settings
TRIAL_PERIOD_DAYS=60
DEFAULT_SUBSCRIPTION_TIER=standard
```

**Production** (Railway/Vercel)
```bash
# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Subscription Settings
TRIAL_PERIOD_DAYS=60
DEFAULT_SUBSCRIPTION_TIER=standard
```

## Timeline

| Phase | Timeline | Key Tasks |
|-------|----------|-----------|
| **Phase 1: Trial Setup** | Now | Add database fields, implement trial tracking, create subscription page |
| **Phase 2: Stripe Integration** | Day 30-45 | Set up Stripe account, implement payment flow, test thoroughly |
| **Phase 3: Pilot Migration** | Day 45-60 | Email campaigns, discount codes, migrate paying users |
| **Phase 4: Launch Paid** | Day 61+ | Fully operational subscription model |

## Testing Checklist

### Phase 1 Testing
- [ ] Trial period calculates correctly (60 days)
- [ ] Trial status displays properly in UI
- [ ] Expired trials block access appropriately
- [ ] Subscription page shows accurate information

### Phase 2 Testing
- [ ] Stripe checkout flow works
- [ ] Successful payment activates subscription
- [ ] Failed payment handled gracefully
- [ ] Webhooks process correctly
- [ ] Customer portal allows cancellation
- [ ] Refunds work properly

### Phase 3 Testing
- [ ] Migration doesn't lose user data
- [ ] Pilot users receive correct pricing
- [ ] Discount codes apply correctly
- [ ] Email notifications send properly

## Support & Documentation

### User-Facing Documentation Needed:
1. **FAQ Page**
   - What happens when trial ends?
   - How to upgrade to paid?
   - Refund policy
   - How to cancel

2. **Pricing Page**
   - Clear tier comparison
   - Feature breakdown
   - Trial information

3. **Email Templates**
   - Welcome email with trial info
   - Trial ending reminders
   - Payment confirmation
   - Receipt/invoice emails

## Legal Considerations

### Terms of Service Updates Needed:
- Trial period terms
- Cancellation policy
- Refund policy
- Auto-renewal disclosure
- Payment terms

### Privacy Policy Updates:
- Stripe data processing
- Payment information storage
- PCI compliance statement

## Cost Estimates

### Monthly Costs (at scale)
- **Stripe fees**: 2.9% + $0.30 per transaction
- **Railway**: ~$20-50/month (depends on usage)
- **Vercel**: Free tier likely sufficient
- **Domain**: ~$1/month

### Example Revenue Calculation:
- 50 pilot users × 60% conversion = 30 paying users
- 30 users × $20/month = $600/month revenue
- Minus Stripe fees (≈$18) = $582/month
- Minus hosting ($30) = $552/month net

## Next Steps

### Immediate Actions (This Week):
1. Decide on final pricing strategy
2. Implement Phase 1 database changes
3. Add trial tracking to registration
4. Create subscription status page

### Short-term (Weeks 2-4):
1. Set up Stripe test account
2. Implement test payment flow
3. Test with dummy accounts
4. Create email templates

### Medium-term (Weeks 4-6):
1. Set up production Stripe account
2. Complete business verification
3. Deploy payment integration
4. Prepare pilot user migration

## Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Checkout**: https://stripe.com/docs/payments/checkout
- **Stripe Customer Portal**: https://stripe.com/docs/billing/subscriptions/customer-portal
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **SaaS Pricing Guide**: https://www.priceintelligently.com/

## Questions to Answer Before Implementation

1. **Pricing**: What will you charge per month?
2. **Discounts**: Will pilot users get special pricing?
3. **Billing Cycle**: Monthly only, or offer annual?
4. **Free Tier**: Any free tier after trial, or paid-only?
5. **Refunds**: What's your refund policy?
6. **Cancellation**: Immediate or end of billing period?
7. **Grace Period**: Any grace period for failed payments?
8. **Support**: What level of support included?

---

**Last Updated**: 2025-11-23
**Status**: Planning Phase
**Next Review**: Before pilot launch
