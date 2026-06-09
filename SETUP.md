# Deploy Carb Quiz (Vercel + Supabase)

## What you get

| URL | Who |
|-----|-----|
| `https://YOUR-APP.vercel.app/` | Students take quiz |
| `https://YOUR-APP.vercel.app/admin` | Teacher views scores + export CSV |

Scores are stored in **Supabase** (free). Each attempt saves name, score, and per-question answers.

---

## Step 1 — Supabase (free database)

1. Go to [supabase.com](https://supabase.com) → Sign up
2. **New project** → choose region (Singapore is closest to Thailand)
3. **SQL Editor** → New query → paste contents of `supabase/schema.sql` → Run
4. **Project Settings → API** → copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — GitHub repo

```bash
cd carb-quiz
git init
git add .
git commit -m "Carbohydrate AP quiz with score tracking"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USER/carb-quiz.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Vercel (free hosting)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New Project** → import `carb-quiz` repo
3. **Environment Variables** (add all 3):

| Name | Value |
|------|-------|
| `SUPABASE_URL` | from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase (service_role) |
| `ADMIN_PASSWORD` | password for /admin page |

4. **Deploy**

Your public URL will be like: `https://carb-quiz-xxx.vercel.app`

---

## Step 4 — Share with students

Send students: `https://YOUR-APP.vercel.app/`

Teacher dashboard: `https://YOUR-APP.vercel.app/admin` (enter ADMIN_PASSWORD)

---

## Local test (optional)

```bash
cd carb-quiz
cp .env.example .env.local   # fill in values
npm install
npx vercel dev
```

Open http://localhost:3000

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Missing SUPABASE_URL" | Add env vars in Vercel → Settings → Environment Variables → Redeploy |
| Admin says Unauthorized | Check ADMIN_PASSWORD matches |
| Submit fails | Run `schema.sql` in Supabase; check service_role key |
