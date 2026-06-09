# Deploy Carb Quiz (Vercel + Supabase)

## What you get

| URL | Who |
|-----|-----|
| `https://YOUR-APP.vercel.app/` | Students take quiz |
| `https://YOUR-APP.vercel.app/admin` | Teacher views scores + export CSV |

Scores are stored in **Supabase** (free). Each attempt saves name, score, and per-question answers.

---

## Step 1 — Supabase (project: ungdcpmarivrrhhmvdbb)

1. Open [SQL Editor](https://supabase.com/dashboard/project/ungdcpmarivrrhhmvdbb/sql/new)
2. Paste contents of `supabase/schema.sql` → **Run**
3. Creates 3 tables + analytics view:
   - `quizzes` — quiz catalog
   - `quiz_attempts` — each student session (score, name, JSON answers)
   - `quiz_answer_details` — one row per question (for analytics at scale)
   - `quiz_question_stats` — view: % correct per question

4. **Project Settings → API** → copy:
   - `Project URL` → `SUPABASE_URL` = `https://ungdcpmarivrrhhmvdbb.supabase.co`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — GitHub repo (asenayai)

Local git is ready. Remote is set to:

`https://github.com/asenayai/carb-quiz.git`

### 2a. Create empty repo on GitHub

1. Open [github.com/new](https://github.com/new?name=carb-quiz&description=Carbohydrate+AP+quiz)
2. Owner: **asenayai**
3. Repository name: **carb-quiz**
4. **Do not** add README, .gitignore, or license (repo must be empty)
5. Click **Create repository**

### 2b. Push from your Mac

```bash
cd "/Users/athita.s/Documents/MWIT_teacher/carb-quiz"
git push -u origin main
```

When prompted for credentials:
- **Username:** `asenayai`
- **Password:** use a [Personal Access Token](https://github.com/settings/tokens) (not your GitHub password)
  - GitHub → Settings → Developer settings → Personal access tokens → Generate (classic)
  - Scope: `repo`

Or sign in via **GitHub Desktop** and push from there.

---

## Step 3 — Vercel (free hosting)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub account **asenayai** (email: asenayai73@gmail.com)
2. **Add New Project** → import **asenayai/carb-quiz** repo
3. **Environment Variables** (add all 3):

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://ungdcpmarivrrhhmvdbb.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from Supabase API settings |
| `ADMIN_PASSWORD` | password for /admin page (you choose) |
| `DATABASE_URL` | *(optional)* Supabase Database URI — for `/api/migrate` auto-setup |

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
