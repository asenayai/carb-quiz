# Setup · Carb Quiz (Next.js)

## 1. Environment variables

Create `.env.local`:

```
SUPABASE_URL=https://ungdcpmarivrrhhmvdbb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_teacher_password
```

## 2. Supabase migrations (CLI)

```bash
npx supabase login
npx supabase link --project-ref ungdcpmarivrrhhmvdbb
npm run db:push
```

Or paste `supabase/migrations/20250609120000_init.sql` in [SQL Editor](https://supabase.com/dashboard/project/ungdcpmarivrrhhmvdbb/sql/new).

## 3. Vercel deploy (CLI)

```bash
npx vercel login
npx vercel link
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add ADMIN_PASSWORD
npm run deploy
```

## 4. Smoke test

- `GET /api/health` → `database: connected`
- `/` → nickname → quiz → review
- `/admin` → load results + CSV export
