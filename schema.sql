-- 开开的科研成长计划 3.2 Supabase 数据表
create table if not exists public.research_growth_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{"tasks":[],"daily":{},"archive":{}}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.research_growth_states enable row level security;
drop policy if exists "Users can select own research state" on public.research_growth_states;
drop policy if exists "Users can insert own research state" on public.research_growth_states;
drop policy if exists "Users can update own research state" on public.research_growth_states;
drop policy if exists "Users can delete own research state" on public.research_growth_states;
create policy "Users can select own research state" on public.research_growth_states for select using (auth.uid() = user_id);
create policy "Users can insert own research state" on public.research_growth_states for insert with check (auth.uid() = user_id);
create policy "Users can update own research state" on public.research_growth_states for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own research state" on public.research_growth_states for delete using (auth.uid() = user_id);
