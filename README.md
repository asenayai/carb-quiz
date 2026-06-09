# Carb Quiz

Next.js quiz for carbohydrate AP review — informal nickname entry, timed questions, post-quiz review, Supabase score tracking.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill Supabase + ADMIN_PASSWORD
npm run dev
```

Open http://localhost:3000

## Deploy

See [SETUP.md](SETUP.md) for Supabase migrations and Vercel deployment.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Nickname entry |
| `/quiz` | Timed quiz |
| `/review/[id]` | Review wrong/missed answers |
| `/admin` | Teacher dashboard |

## Janaru

Session tracking in `journals/` — say `loadgame` to resume.
