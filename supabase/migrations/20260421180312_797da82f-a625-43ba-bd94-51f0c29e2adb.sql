
-- Daily study targets per user
create table public.study_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_date date not null,
  module text not null,
  topic text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_study_targets_user_date on public.study_targets(user_id, target_date);
alter table public.study_targets enable row level security;
create policy "own select" on public.study_targets for select using (auth.uid() = user_id);
create policy "own insert" on public.study_targets for insert with check (auth.uid() = user_id);
create policy "own update" on public.study_targets for update using (auth.uid() = user_id);
create policy "own delete" on public.study_targets for delete using (auth.uid() = user_id);

-- Conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
create policy "own select" on public.conversations for select using (auth.uid() = user_id);
create policy "own insert" on public.conversations for insert with check (auth.uid() = user_id);
create policy "own update" on public.conversations for update using (auth.uid() = user_id);
create policy "own delete" on public.conversations for delete using (auth.uid() = user_id);

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index idx_messages_conv on public.messages(conversation_id, created_at);
alter table public.messages enable row level security;
create policy "own select" on public.messages for select using (auth.uid() = user_id);
create policy "own insert" on public.messages for insert with check (auth.uid() = user_id);
create policy "own delete" on public.messages for delete using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_targets_updated before update on public.study_targets
  for each row execute function public.touch_updated_at();
create trigger trg_conv_updated before update on public.conversations
  for each row execute function public.touch_updated_at();
