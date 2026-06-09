-- Run once in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  score integer not null,
  max_score integer not null,
  correct_count integer not null,
  total_questions integer not null,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_created_at_idx
  on quiz_attempts (created_at desc);

create index if not exists quiz_attempts_score_idx
  on quiz_attempts (score desc);

-- Optional: allow read-only public leaderboard via RLS (API uses service role)
alter table quiz_attempts enable row level security;
