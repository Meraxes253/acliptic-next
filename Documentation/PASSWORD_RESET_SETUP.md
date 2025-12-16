# Password Reset Implementation Guide

## Email Service Setup (Using Resend)

### 1. Install Resend
```bash
npm install resend
```

### 2. Get API Key
1. Go to https://resend.com and create an account
2. Verify your domain (or use their test domain for development)
3. Get your API key from the dashboard

### 3. Add Environment Variable
Add to your `.env` or `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
# For development, you can use Resend's test emails
RESEND_FROM_EMAIL=onboarding@resend.dev
# For production, use your verified domain
# RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Database Schema

You'll need to add a `passwordResetTokens` table to your database:

```typescript
// Add to your schema file (e.g., src/db/schema/passwordResetTokens.ts)
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## Run Migration
```bash
# Generate migration
npm run db:generate

# Run migration
npm run db:migrate
```

## Security Best Practices

1. **Tokens expire in 1 hour** - Short-lived for security
2. **Tokens are hashed** - Stored securely in database
3. **One-time use** - Tokens deleted after use
4. **Rate limiting** - Prevent spam (implement if needed)
5. **HTTPS only** - Always use secure connections in production

## Testing

### Development Testing
- Use Resend's test domain: `onboarding@resend.dev`
- Emails will be sent to your verified email
- Check Resend dashboard for email logs

### Production
- Verify your domain in Resend
- Update `RESEND_FROM_EMAIL` to use your domain
- Test the complete flow

## Alternative Email Services

If you prefer other services:

### SendGrid
```bash
npm install @sendgrid/mail
```
```env
SENDGRID_API_KEY=your_key_here
```

### Nodemailer (for custom SMTP)
```bash
npm install nodemailer
```
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Features Implemented

1. ✅ Forgot Password page
2. ✅ Password Reset with token validation
3. ✅ Email sending with secure tokens
4. ✅ Change Password in Profile section
5. ✅ Token expiration (1 hour)
6. ✅ Secure password hashing with bcrypt
7. ✅ User-friendly error messages

## File Structure
```
src/
├── app/
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── reset-password/
│   │   └── [token]/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   ├── forgot-password/
│       │   │   └── route.ts
│       │   └── reset-password/
│       │       └── route.ts
│       └── user/
│           └── change-password/
│               └── route.ts
├── components/
│   └── Profile/
│       └── ProfileTab.tsx (updated)
├── db/
│   └── schema/
│       └── passwordResetTokens.ts (new)
└── lib/
    └── email.ts (new)
```
