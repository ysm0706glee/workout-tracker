-- ============================================
-- IronLog: Supabase Database Schema
-- ============================================

-- User preferences (unit: kg/lb)
create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  unit text not null default 'kg' check (unit in ('kg', 'lb')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Custom exercise library per user
create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  muscle_group text not null,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, muscle_group, name)
);

-- Workout routines (templates)
create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  local_id text,
  name text not null,
  exercises jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Logged workouts
create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  local_id text,
  date date not null,
  unit text not null default 'kg',
  exercises jsonb not null default '[]',
  notes text,
  created_at timestamptz default now()
);

-- Index for faster queries
create index idx_workouts_user_date on workouts(user_id, date desc);
create index idx_routines_user on routines(user_id);
create index idx_exercises_user on exercises(user_id);

-- ============================================
-- Row Level Security
-- ============================================

alter table user_preferences enable row level security;
alter table exercises enable row level security;
alter table routines enable row level security;
alter table workouts enable row level security;

create policy "Users manage own preferences" on user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own exercises" on exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own routines" on routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own workouts" on workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
