-- Track AI routine generation usage per user per month
create table ai_usage (
  user_id uuid references auth.users(id) on delete cascade not null,
  period text not null, -- Format: 'YYYY-MM'
  generation_count int not null default 0,
  primary key (user_id, period)
);

alter table ai_usage enable row level security;

create policy "Users manage own ai usage" on ai_usage
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
