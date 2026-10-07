-- Wrap auth.uid() in a subselect so Postgres evaluates it once per query
-- (initplan) instead of once per row. Behavior is unchanged.

alter policy "Users manage own preferences" on user_preferences
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter policy "Users manage own exercises" on exercises
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter policy "Users manage own routines" on routines
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter policy "Users manage own workouts" on workouts
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter policy "Users manage own profile" on user_profiles
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter policy "Users manage own push subscriptions" on push_subscriptions
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
