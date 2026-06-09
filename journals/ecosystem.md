# Ecosystem · carb-quiz

| Field | Value |
|-------|-------|
| Project | carb-quiz |
| Stack | Next.js 15 App Router, Tailwind v4, TypeScript |
| Fonts | Geist Sans, Geist Mono (`next/font`) |
| DB | Supabase (`ungdcpmarivrrhhmvdbb`) |
| Deploy | Vercel (`asenayai/carb-quiz`) |
| Package manager | npm |

## Commands

| Task | Command |
|------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| DB push | `npm run db:push` |
| Deploy | `npm run deploy` |

## Env vars

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

## Conventions

- Server-side score validation only
- Nickname maps to `student_name` in DB
- Quiz id: `carb-ap`
