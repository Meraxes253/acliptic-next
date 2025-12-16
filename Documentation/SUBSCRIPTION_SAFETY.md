# One Subscription Per User - Complete Implementation

## Summary

I've implemented a **3-layer protection system** to ensure each user can only have ONE active paid subscription at a time, preventing double-billing and subscription conflicts.

---

## Protection Layers

### ✅ Layer 1: Database Constraint (Strongest)
**File:** `database-migrations/add-unique-active-subscription-constraint.sql`

**What it does:**
- Creates a unique partial index on `subscriptions(user_id)` where `is_active = true`
- **Database-level enforcement** - cannot be bypassed by code
- Allows multiple subscription records per user (for history)
- But only ONE can be active at any time

**How to apply:**
```bash
psql -U your_username -d your_database -f database-migrations/add-unique-active-subscription-constraint.sql
```

**Impact:**
- ✅ User can have: Free (active) → Upgrade to Basic (active) → Old Free becomes inactive
- ✅ User can have: Basic (active) + Old Pro (inactive) → History preserved
- ❌ User CANNOT have: Basic (active) + Pro (active) → **Database error**

---

### ✅ Layer 2: Server-Side Check (API Route)
**File:** `src/app/api/checkout/route.ts`

**What it does:**
- Before creating a Stripe checkout session, checks if user already has an active paid subscription
- Returns error with code `EXISTING_SUBSCRIPTION` if they do
- Prevents creating a second Stripe subscription

**Code added:**
```typescript
// Check if user already has an active paid subscription
const existingSubscriptions = await db
  .select()
  .from(subscriptions)
  .where(
    and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.is_active, true)
    )
  )

const hasActivePaidSubscription = existingSubscriptions.some(
  (sub) => sub.stripeSubscriptionId &&
           sub.stripeSubscriptionId !== '' &&
           !sub.stripeSubscriptionId.startsWith('free_')
)

if (hasActivePaidSubscription) {
  return Response.json({
    error: "You already have an active subscription. Please manage your subscription through the billing portal.",
    code: "EXISTING_SUBSCRIPTION"
  }, { status: 400 })
}
```

**Impact:**
- User with active Basic plan tries to checkout Pro plan → **Blocked with error message**
- They must use billing portal to change plans instead

---

### ✅ Layer 3: Frontend Check (User Experience)
**File:** `src/components/main/PricingPlansComponent.tsx`

**What it does:**
- Checks user's current subscription before allowing plan selection
- If user has active paid subscription:
  - Clicking same plan → Shows "Already subscribed" message
  - Clicking different plan → Opens billing portal (not checkout)
- Provides smooth UX without hitting API unnecessarily

**Impact:**
- User sees "Current Plan" badge on their plan
- Clicking another plan opens Stripe billing portal
- No confusing checkout errors

---

## How It All Works Together

### Scenario 1: User on Free → Upgrades to Basic ✅
```
1. Frontend: User clicks "Get Started" on Basic
2. Frontend: Detects no paid subscription → Proceeds to checkout
3. Server: Checks database → No active paid subscription → Creates checkout
4. Stripe: User pays → Webhook fires
5. Webhook: Creates new subscription, marks old Free as inactive
6. Database constraint: Ensures only ONE active subscription
```

### Scenario 2: User on Basic → Tries to Buy Pro (Wrong Way) ❌
```
1. Frontend: User somehow bypasses client check
2. Server: Checks database → Active Basic subscription exists
3. Server: Returns error: "EXISTING_SUBSCRIPTION"
4. User sees error message
```

### Scenario 3: User on Basic → Upgrades to Pro (Correct Way) ✅
```
1. Frontend: User clicks "Get Started" on Pro
2. Frontend: Detects existing subscription → Opens billing portal
3. Stripe Portal: User changes plan Basic → Pro
4. Stripe: Prorates charges, updates subscription
5. Webhook: Updates existing subscription record (same ID)
6. Database: Still only ONE active subscription (just different plan)
```

---

## Testing

### Test 1: Verify Database Constraint
```sql
-- Try to create two active subscriptions for same user (should fail)
INSERT INTO subscriptions (user_id, stripe_subscription_id, is_active, price_id, stripe_customer_id)
VALUES ('test-user-id', 'sub_test_1', true, 'price_basic', 'cus_test');

-- This should ERROR (violates unique constraint)
INSERT INTO subscriptions (user_id, stripe_subscription_id, is_active, price_id, stripe_customer_id)
VALUES ('test-user-id', 'sub_test_2', true, 'price_pro', 'cus_test');
```

### Test 2: Server-Side Protection
```bash
# With existing active subscription, try to checkout
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_pro"}'

# Expected: 400 error with code "EXISTING_SUBSCRIPTION"
```

### Test 3: Frontend Flow
```
1. User has active Basic subscription
2. Go to pricing page
3. Basic plan shows "Current Plan" badge
4. Click Pro plan → Billing portal opens (NOT checkout)
5. In portal, change plan → Success
```

---

## Migration Steps

### Step 1: Check for Existing Duplicates
```sql
-- Check if any users have multiple active subscriptions
SELECT user_id, COUNT(*) as active_count
FROM subscriptions
WHERE is_active = true
GROUP BY user_id
HAVING COUNT(*) > 1;
```

If any results, clean them up:
```sql
-- Keep only the most recent active subscription per user
WITH ranked_subscriptions AS (
  SELECT
    id,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY "createdAt" DESC
    ) AS rn
  FROM subscriptions
  WHERE is_active = true
)
UPDATE subscriptions
SET is_active = false
WHERE id IN (
  SELECT id
  FROM ranked_subscriptions
  WHERE rn > 1
);
```

### Step 2: Apply Database Constraint
```bash
psql -U your_username -d your_database -f database-migrations/add-unique-active-subscription-constraint.sql
```

### Step 3: Verify
```sql
-- Should show the new index
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'subscriptions'
  AND indexname = 'unique_active_subscription_per_user';
```

---

## Benefits

### Before (Unsafe):
- ❌ User could create multiple Stripe subscriptions
- ❌ Get charged multiple times
- ❌ Confusion about which subscription is "real"
- ❌ Manual cleanup required
- ❌ Support tickets for refunds

### After (Safe):
- ✅ **One active subscription per user** (enforced at DB level)
- ✅ Plan changes go through billing portal (Stripe handles proration)
- ✅ Subscription history preserved (inactive records)
- ✅ Clear error messages
- ✅ No double-billing possible
- ✅ Industry-standard approach

---

## Important Notes

### Free Subscriptions
- Free subscriptions have `stripeSubscriptionId` starting with `free_`
- These are excluded from the "active paid subscription" check
- User can have free subscription and later upgrade to paid
- Old free subscription becomes inactive automatically

### Subscription Changes
- **Correct way:** Stripe Billing Portal
  - Handles proration
  - Updates existing subscription
  - No new subscription created

- **Wrong way:** New checkout
  - Would create second subscription (now blocked!)
  - Would cause double billing (prevented!)

### History Preservation
- The unique constraint only applies when `is_active = true`
- Users can have unlimited inactive subscriptions (history)
- Example valid state:
  ```
  Free (inactive, created Jan 1)
  Basic (inactive, created Feb 1)
  Pro (active, created Mar 1)  ← Current subscription
  ```

---

## Rollback

If you need to remove the constraint:

```sql
DROP INDEX IF EXISTS unique_active_subscription_per_user;
```

Then remove the server-side check from `checkout/route.ts`.

---

## Summary

Your subscription system now has **3 layers of protection**:

1. 🛡️ **Database constraint** - Cannot be bypassed
2. 🛡️ **Server-side check** - Validates before Stripe
3. 🛡️ **Frontend check** - Better UX

This ensures:
- ✅ One active subscription per user
- ✅ No double-billing
- ✅ Clean subscription management
- ✅ Industry-standard behavior

**Status:** ✅ Production Ready

---

Generated: December 7, 2025
