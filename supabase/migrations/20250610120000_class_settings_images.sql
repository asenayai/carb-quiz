-- Class sessions, quiz settings, and image storage for multi-class use

alter table quiz_attempts
  add column if not exists class_label text not null default 'ทั่วไป';

create index if not exists quiz_attempts_class_label_idx
  on quiz_attempts (quiz_id, class_label);

create table if not exists quiz_settings (
  quiz_id text not null references quizzes(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (quiz_id, key)
);

insert into quiz_settings (quiz_id, key, value)
values ('carb-ap', 'current_class', '"ทั่วไป"'::jsonb)
on conflict (quiz_id, key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quiz-images',
  'quiz-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

create policy if not exists "quiz_images_public_read"
  on storage.objects for select
  using (bucket_id = 'quiz-images');
