-- Carb Quiz · initial schema

create table if not exists quizzes (
  id text primary key,
  title text not null,
  total_questions integer not null,
  max_score integer not null,
  created_at timestamptz not null default now()
);

insert into quizzes (id, title, total_questions, max_score)
values ('carb-ap', 'คาร์โบไฮเดรต · AP Review', 5, 5000)
on conflict (id) do nothing;

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null references quizzes(id),
  student_name text not null,
  student_id text,
  score integer not null,
  max_score integer not null,
  correct_count integer not null,
  total_questions integer not null,
  duration_sec integer,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_quiz_id_idx on quiz_attempts (quiz_id);
create index if not exists quiz_attempts_created_at_idx on quiz_attempts (created_at desc);
create index if not exists quiz_attempts_student_name_idx on quiz_attempts (student_name);
create index if not exists quiz_attempts_score_idx on quiz_attempts (score desc);

create table if not exists quiz_answer_details (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references quiz_attempts(id) on delete cascade,
  question_num integer not null,
  picked_index integer,
  correct_index integer not null,
  is_correct boolean not null,
  points integer not null default 0,
  time_left_sec integer,
  choice_text text,
  unique (attempt_id, question_num)
);

create index if not exists quiz_answer_details_attempt_idx on quiz_answer_details (attempt_id);
create index if not exists quiz_answer_details_question_idx on quiz_answer_details (question_num);

create or replace view quiz_question_stats as
select
  a.quiz_id,
  d.question_num,
  count(*) as total_attempts,
  count(*) filter (where d.is_correct) as correct_count,
  round(
    100.0 * count(*) filter (where d.is_correct) / nullif(count(*), 0),
    1
  ) as pct_correct
from quiz_answer_details d
join quiz_attempts a on a.id = d.attempt_id
group by a.quiz_id, d.question_num
order by a.quiz_id, d.question_num;

alter table quizzes enable row level security;
alter table quiz_attempts enable row level security;
alter table quiz_answer_details enable row level security;
