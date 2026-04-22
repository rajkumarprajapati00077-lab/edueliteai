-- 1. profiles table
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  display_name text,
  exam_track text not null default 'CA Final',
  attempt_date date,
  theme text not null default 'premium-dark',
  daily_minutes_goal int not null default 120,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles select own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = user_id);

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 2. daily_goal_log
create table public.daily_goal_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  log_date date not null default current_date,
  minutes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

alter table public.daily_goal_log enable row level security;

create policy "dgl select own" on public.daily_goal_log for select using (auth.uid() = user_id);
create policy "dgl insert own" on public.daily_goal_log for insert with check (auth.uid() = user_id);
create policy "dgl update own" on public.daily_goal_log for update using (auth.uid() = user_id);
create policy "dgl delete own" on public.daily_goal_log for delete using (auth.uid() = user_id);

create trigger dgl_touch_updated_at
before update on public.daily_goal_log
for each row execute function public.touch_updated_at();

-- 3. notes catalog
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null,
  course text not null,            -- CA / CS / CMA
  level text not null default 'Foundation', -- Foundation / Inter / Final
  subject text not null,
  chapter text not null,
  title text not null,
  file_path text,                  -- path inside notes storage bucket
  is_ai_generated boolean not null default false,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

-- Shared notes (not private) are visible to all authenticated users; private ones only to owner
create policy "notes select shared or own" on public.notes for select
using (auth.uid() is not null and (is_private = false or auth.uid() = uploaded_by));

create policy "notes insert own" on public.notes for insert with check (auth.uid() = uploaded_by);
create policy "notes update own" on public.notes for update using (auth.uid() = uploaded_by);
create policy "notes delete own" on public.notes for delete using (auth.uid() = uploaded_by);

create trigger notes_touch_updated_at
before update on public.notes
for each row execute function public.touch_updated_at();

create index notes_course_idx on public.notes(course, level, subject);

-- 4. storage bucket for note PDFs
insert into storage.buckets (id, name, public) values ('notes', 'notes', true)
on conflict (id) do nothing;

create policy "notes pdf public read"
on storage.objects for select
using (bucket_id = 'notes');

create policy "notes pdf auth upload"
on storage.objects for insert
with check (bucket_id = 'notes' and auth.uid() is not null and auth.uid()::text = (storage.foldername(name))[1]);

create policy "notes pdf owner update"
on storage.objects for update
using (bucket_id = 'notes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "notes pdf owner delete"
on storage.objects for delete
using (bucket_id = 'notes' and auth.uid()::text = (storage.foldername(name))[1]);