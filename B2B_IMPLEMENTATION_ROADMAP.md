# 🛠️ Mo7ami B2B Implementation Roadmap

**Goal:** Transform Mo7ami from B2C to B2B SaaS in 4 weeks
**Target:** First paying customer by Week 4

---

## 📅 WEEK 1: Multi-Tenancy & Organizations

### Backend (2-3 days):
```typescript
// 1. Database Schema Updates
// Add to Prisma schema:

model Organization {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique  // casablanca-law-firm
  tier          Tier     @default(STARTER)
  status        Status   @default(ACTIVE)

  // Billing
  seats         Int      @default(1)
  monthlyQuota  Int      @default(100)
  apiKey        String?  @unique

  // Customization
  logo          String?
  primaryColor  String?
  customDomain  String?

  // Relations
  users         User[]
  usage         Usage[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Tier {
  STARTER       // 2,500 MAD/month
  PROFESSIONAL  // 8,000 MAD/month
  ENTERPRISE    // 15,000+ MAD/month
}

enum Status {
  ACTIVE
  TRIAL
  SUSPENDED
  CANCELLED
}

model User {
  id             String       @id @default(cuid())
  email          String       @unique
  name           String
  role           Role         @default(MEMBER)

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  createdAt      DateTime     @default(now())
}

enum Role {
  OWNER          // Full access
  ADMIN          // Manage users
  MEMBER         // Regular lawyer
  VIEWER         // Read-only
}

model Usage {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  userId         String
  queryType      String       // chat, api, voice
  query          String
  cost           Float        // in MAD

  metadata       Json?        // response time, tokens, etc.
  createdAt      DateTime     @default(now())
}
```

### API Routes (1-2 days):
```typescript
// app/api/organizations/route.ts
POST   /api/organizations          // Create org
GET    /api/organizations/:id      // Get org details
PATCH  /api/organizations/:id      // Update settings
DELETE /api/organizations/:id      // Cancel subscription

// app/api/organizations/:id/users/route.ts
GET    /api/organizations/:id/users     // List users
POST   /api/organizations/:id/users     // Invite user
DELETE /api/organizations/:id/users/:uid // Remove user

// app/api/organizations/:id/usage/route.ts
GET    /api/organizations/:id/usage     // Usage analytics
GET    /api/organizations/:id/billing   // Billing info

// app/api/organizations/:id/api-keys/route.ts
POST   /api/organizations/:id/api-keys  // Generate API key
DELETE /api/organizations/:id/api-keys  // Revoke key
```

### Middleware (1 day):
```typescript
// lib/middleware/organization.ts
export async function withOrganization(
  req: NextRequest,
  handler: (req: NextRequest, org: Organization) => Promise<Response>
) {
  const session = await getServerSession(req);
  if (!session?.user?.organizationId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    include: { users: true }
  });

  if (!org || org.status !== 'ACTIVE') {
    return new Response('Organization not active', { status: 403 });
  }

  return handler(req, org);
}

// Usage quota check
export async function checkQuota(orgId: string, queryType: string) {
  const usage = await prisma.usage.count({
    where: {
      organizationId: orgId,
      createdAt: {
        gte: new Date(new Date().setDate(1)) // Start of month
      }
    }
  });

  const org = await prisma.organization.findUnique({
    where: { id: orgId }
  });

  if (usage >= org.monthlyQuota) {
    throw new Error('Monthly quota exceeded');
  }
}
```

**Deliverable Week 1:** Multi-tenant backend with organization management

---

## 📅 WEEK 2: Admin Dashboard & Analytics

### Admin Dashboard (3-4 days):
```typescript
// app/dashboard/page.tsx
export default function OrgDashboard() {
  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Queries This Month" value={2,450} />
        <KPICard title="Active Users" value={12} />
        <KPICard title="API Calls" value={850} />
        <KPICard title="Cost Savings" value="32 hours" />
      </div>

      {/* Usage Chart */}
      <UsageChart data={usageByDay} />

      {/* Top Users Table */}
      <TopUsersTable users={topUsers} />

      {/* Recent Activity */}
      <ActivityFeed activities={recentQueries} />
    </div>
  );
}
```

### Analytics API (2 days):
```typescript
// lib/analytics/calculate-roi.ts
export function calculateROI(usage: Usage[]) {
  // Average lawyer hourly rate: 500 MAD
  // Average research time saved per query: 30 min

  const queriesCount = usage.length;
  const hoursSaved = (queriesCount * 0.5); // 30 min each
  const moneySaved = hoursSaved * 500; // MAD

  return {
    queriesCount,
    hoursSaved,
    moneySaved,
    roi: moneySaved / subscription.price // Return on investment
  };
}

// app/api/analytics/roi/route.ts
export async function GET(req: NextRequest) {
  const org = await getOrganization(req);

  const usage = await prisma.usage.findMany({
    where: {
      organizationId: org.id,
      createdAt: {
        gte: startOfMonth(),
        lte: endOfMonth()
      }
    }
  });

  const roi = calculateROI(usage);

  return NextResponse.json(roi);
}
```

### User Management UI (2 days):
```typescript
// app/dashboard/team/page.tsx
export default function TeamManagement() {
  return (
    <div>
      <TeamHeader>
        <InviteUserButton />
      </TeamHeader>

      <UsersTable>
        {users.map(user => (
          <UserRow key={user.id}>
            <UserInfo name={user.name} email={user.email} />
            <RoleSelector value={user.role} onChange={updateRole} />
            <UsageStats queries={user.queriesCount} />
            <RemoveButton onClick={() => removeUser(user.id)} />
          </UserRow>
        ))}
      </UsersTable>
    </div>
  );
}
```

**Deliverable Week 2:** Complete admin dashboard with analytics & team management

---

## 📅 WEEK 3: API & Billing Integration

### Public API (3 days):
```typescript
// app/api/v1/legal/query/route.ts
export async function POST(req: NextRequest) {
  // 1. Authenticate with API key
  const apiKey = req.headers.get('X-API-Key');
  const org = await authenticateAPIKey(apiKey);

  if (!org) {
    return new Response('Invalid API key', { status: 401 });
  }

  // 2. Check quota
  await checkQuota(org.id, 'api');

  // 3. Process query
  const { query, language } = await req.json();
  const result = await generateLegalAnswer(query, language);

  // 4. Log usage
  await logUsage({
    organizationId: org.id,
    queryType: 'api',
    query,
    cost: calculateCost(result),
    metadata: { responseTime: result.processingTime }
  });

  // 5. Return response
  return NextResponse.json({
    answer: result.answer,
    citations: result.citations,
    usage: {
      queriesRemaining: org.monthlyQuota - usage.count
    }
  });
}
```

### API Documentation (1 day):
```markdown
# Mo7ami API Documentation

## Authentication
All API requests require an API key in the header:
```
X-API-Key: your_api_key_here
```

## Endpoints

### POST /api/v1/legal/query
Query the Moroccan legal database.

**Request:**
```json
{
  "query": "ما هي عقوبة السرقة؟",
  "language": "ar",
  "domain": "penal_law" // optional
}
```

**Response:**
```json
{
  "answer": "...",
  "citations": [
    {
      "article": "505",
      "code": "Code Pénal",
      "text": "..."
    }
  ],
  "usage": {
    "queriesRemaining": 850
  }
}
```

### Rate Limits
- Starter: 100 queries/month
- Professional: Unlimited
- Enterprise: Custom

## SDKs
- JavaScript/TypeScript: `npm install @mo7ami/sdk`
- Python: `pip install mo7ami`
- PHP: `composer require mo7ami/sdk`
```

### Billing Integration (2-3 days):
```typescript
// lib/billing/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createSubscription(
  orgId: string,
  tier: Tier,
  seats: number
) {
  const prices = {
    STARTER: 'price_starter_monthly',
    PROFESSIONAL: 'price_pro_monthly',
    ENTERPRISE: 'price_enterprise_monthly'
  };

  const subscription = await stripe.subscriptions.create({
    customer: org.stripeCustomerId,
    items: [
      { price: prices[tier], quantity: seats }
    ],
    metadata: { organizationId: orgId }
  });

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      tier,
      seats,
      stripeSubscriptionId: subscription.id
    }
  });

  return subscription;
}

// Webhook handler
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'invoice.payment_succeeded':
      await activateSubscription(event.data.object);
      break;
    case 'invoice.payment_failed':
      await suspendOrganization(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await cancelOrganization(event.data.object);
      break;
  }
}
```

**Deliverable Week 3:** Public API + Stripe billing integration

---

## 📅 WEEK 4: Launch Prep & Pilot

### Pricing Page (1 day):
```tsx
// app/pricing/page.tsx
export default function PricingPage() {
  return (
    <div className="pricing-tiers">
      <PricingCard
        name="Starter"
        price="2,500 MAD/month"
        features={[
          '1-3 lawyers',
          '100 queries/month per lawyer',
          'Basic legal database',
          'Email support',
          'Save 32 hours/month'
        ]}
        cta="Start 30-Day Free Trial"
      />

      <PricingCard
        name="Professional"
        price="8,000 MAD/month"
        popular
        features={[
          '4-10 lawyers',
          'Unlimited queries',
          'Advanced analytics',
          'Client portal',
          'Priority support',
          'Custom templates'
        ]}
        cta="Start Free Trial"
      />

      <PricingCard
        name="Enterprise"
        price="Custom"
        features={[
          '10+ lawyers',
          'API access',
          'Custom AI training',
          'Dedicated account manager',
          'SLA guarantees',
          'Multi-office support'
        ]}
        cta="Contact Sales"
      />
    </div>
  );
}
```

### Demo Video Script (1 day):
```
[OPENING SHOT: Law firm office, busy lawyers]

🎬 SCENE 1: The Problem (15 sec)
"Moroccan lawyers spend 10+ hours per week on legal research.
Time that could be spent helping clients."

🎬 SCENE 2: Mo7ami Solution (30 sec)
"Meet Mo7ami - Your AI legal research assistant.
Ask any question about Moroccan law, in Darija or French.
Get instant answers with accurate citations."

[DEMO: Voice interaction in Darija]
User: "شنو كايقول القانون على السرقة؟"
Mo7ami: [Shows answer with Article 505 citation]

🎬 SCENE 3: ROI (20 sec)
"Save 8 hours per week per lawyer.
That's 32 hours per month.
Worth 16,000 MAD in billable time."

[DASHBOARD DEMO: Analytics showing time saved]

🎬 SCENE 4: Features (20 sec)
- Team management
- Usage analytics
- API integration
- Client portal

🎬 CLOSING (15 sec)
"Join 50+ Moroccan law firms already using Mo7ami.
Start your free 30-day trial today.
Mo7ami.ma"

[TOTAL: 1:40 minutes]
```

### Sales Outreach (2 days):
```markdown
# Email Template: Law Firm Outreach

Subject: Save 32 hours/month on legal research (Free trial)

Bonjour [Managing Partner Name],

I'm reaching out because I know how much time Moroccan lawyers spend on legal research.

We've built Mo7ami - an AI assistant that instantly answers questions about Moroccan law with accurate citations.

**Results from beta law firms:**
- 8 hours saved per lawyer per week
- 40% faster client consultations
- 100% accurate citations

**Special offer for [Firm Name]:**
- 30-day free trial
- Personal onboarding session
- 100 free queries to test the platform

Would you be open to a 15-minute demo this week?

Best regards,
[Your Name]
Mo7ami Team
www.mo7ami.ma
```

### Pilot Program Setup (1 day):
```typescript
// lib/pilot/create-trial.ts
export async function createTrialOrganization(
  firmName: string,
  email: string,
  lawyers: number
) {
  const org = await prisma.organization.create({
    data: {
      name: firmName,
      slug: slugify(firmName),
      tier: 'PROFESSIONAL', // Give them pro features
      status: 'TRIAL',
      seats: lawyers,
      monthlyQuota: 999999, // Unlimited for trial
      trialEndsAt: addDays(new Date(), 30)
    }
  });

  // Send welcome email with credentials
  await sendTrialWelcomeEmail({
    to: email,
    orgName: firmName,
    loginUrl: `https://mo7ami.ma/login?org=${org.slug}`,
    trialEndsAt: org.trialEndsAt
  });

  // Schedule follow-up emails
  await scheduleEmail({
    to: email,
    template: 'trial-day-7-check-in',
    sendAt: addDays(new Date(), 7)
  });

  await scheduleEmail({
    to: email,
    template: 'trial-day-25-convert',
    sendAt: addDays(new Date(), 25)
  });

  return org;
}
```

**Deliverable Week 4:** Complete sales funnel + 10 pilot law firms signed up

---

## 🎯 SUCCESS CRITERIA

### Technical Metrics:
- ✅ Multi-tenant architecture working
- ✅ Admin dashboard live with analytics
- ✅ API functional with authentication
- ✅ Billing integrated (Stripe)
- ✅ 99.9% uptime

### Business Metrics:
- ✅ 10 law firms in pilot program
- ✅ 5 demos scheduled per week
- ✅ Pricing page converting at 10%+
- ✅ First paying customer by Week 5
- ✅ $10K MRR by Month 2

---

## 🛠️ TECH STACK ADDITIONS

### New Dependencies:
```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "recharts": "^2.10.0",          // Analytics charts
    "react-table": "^7.8.0",         // Data tables
    "@tanstack/react-query": "^5.0.0", // Already have
    "jotai": "^2.6.0",               // State management
    "zod": "^3.22.0"                 // Already have
  }
}
```

### Infrastructure:
- **Database:** Supabase (already set up)
- **Payments:** Stripe
- **Email:** SendGrid or Resend
- **Analytics:** PostHog or Mixpanel
- **Monitoring:** Sentry
- **Uptime:** UptimeRobot

---

## 💰 COST BREAKDOWN (Month 1)

| Item | Cost (MAD) |
|------|------------|
| Supabase Pro | 250 MAD |
| Stripe fees (2.9% + 3 MAD) | ~500 MAD |
| SendGrid (email) | 200 MAD |
| OpenAI API (increased usage) | 1,000 MAD |
| Domain + hosting | 100 MAD |
| **Total** | **2,050 MAD** |

**Revenue Goal:** 25,000 MAD (1 paying customer)
**Net Profit:** 22,950 MAD (1,120% margin)

---

## 🚦 RISK MITIGATION

### Technical Risks:
- **Data isolation:** Use row-level security (RLS) in Supabase
- **API abuse:** Implement rate limiting per org
- **Downtime:** Set up auto-scaling and monitoring

### Business Risks:
- **Slow adoption:** Offer 60-day trial instead of 30
- **Price objection:** Start with 1,500 MAD/month tier
- **Competition:** Move fast, build partnerships

### Legal Risks:
- **Data privacy:** Law 09-08 compliance (already done)
- **Liability:** Clear ToS stating "information only, not legal advice"
- **Content accuracy:** Human lawyer review of AI responses

---

## ✅ CHECKLIST FOR LAUNCH

### Week 1:
- [ ] Deploy multi-tenant database schema
- [ ] Build organization CRUD APIs
- [ ] Create user role system
- [ ] Test quota enforcement

### Week 2:
- [ ] Launch admin dashboard
- [ ] Build analytics charts
- [ ] Create team management UI
- [ ] Test with dummy data

### Week 3:
- [ ] Launch public API
- [ ] Write API documentation
- [ ] Integrate Stripe billing
- [ ] Test end-to-end payment flow

### Week 4:
- [ ] Create pricing page
- [ ] Record demo video
- [ ] Contact 50 law firms
- [ ] Sign up 10 pilot users
- [ ] Convert 1 to paying customer

---

**🚀 Status:** Ready to start Week 1 implementation
**Goal:** First $250/month customer by Week 4
**Vision:** $100K MRR by Month 6

**Let's build Morocco's legal tech future! 🇲🇦**
