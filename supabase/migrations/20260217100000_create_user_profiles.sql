-- User profiles (fitness goal, experience, equipment, display name)
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  fitness_goal text check (fitness_goal in ('strength', 'hypertrophy', 'endurance', 'general')),
  experience text check (experience in ('beginner', 'intermediate', 'advanced')),
  equipment text check (equipment in ('full_gym', 'dumbbells', 'home_gym', 'bodyweight')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

create policy "Users manage own profile" on user_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
