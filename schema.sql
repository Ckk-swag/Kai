-- 开开的科研成长计划 4.2 Supabase 数据表
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

-- 4.2 AI 复盘账号配置：前端只调用 Supabase Edge Function，真正的 AI API Key 按用户保存，供后端函数读取。
create table if not exists public.research_growth_ai_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'deepseek',
  api_base_url text not null default 'https://api.deepseek.com',
  model text not null default 'deepseek-v4-flash',
  api_key text not null,
  updated_at timestamptz not null default now()
);
alter table public.research_growth_ai_settings enable row level security;
drop policy if exists "Users can select own ai settings" on public.research_growth_ai_settings;
drop policy if exists "Users can insert own ai settings" on public.research_growth_ai_settings;
drop policy if exists "Users can update own ai settings" on public.research_growth_ai_settings;
drop policy if exists "Users can delete own ai settings" on public.research_growth_ai_settings;
create policy "Users can select own ai settings" on public.research_growth_ai_settings for select using (auth.uid() = user_id);
create policy "Users can insert own ai settings" on public.research_growth_ai_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own ai settings" on public.research_growth_ai_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own ai settings" on public.research_growth_ai_settings for delete using (auth.uid() = user_id);
