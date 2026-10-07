-- AI routine generation was removed; drop its usage tracking table
drop table if exists ai_usage;

-- Profile fields that only fed the AI routine generator
alter table user_profiles drop column if exists fitness_goal;
alter table user_profiles drop column if exists equipment;
