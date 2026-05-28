-- RLS policies for the GeniusSeeker OS recruiter app.
--
-- The OS connects to the join-orion Supabase project, which already had
-- RLS enabled on candidate_applications with INSERT/UPDATE policies for
-- anon (so the public careers form works) but no SELECT policy. This
-- migration grants the policies the OS needs:
--
--   - authenticated recruiters can read/write candidate_applications,
--     candidate_activity, contributors
--   - anon (public referral landing) can read contributors by id and
--     insert into candidate_applications + candidate_activity
--
-- Idempotent: every policy is DROP IF EXISTS + CREATE so re-running is safe.

-- ---------------------------------------------------------------------
-- candidate_applications
-- ---------------------------------------------------------------------

alter table public.candidate_applications enable row level security;

drop policy if exists "Authenticated can read candidates" on public.candidate_applications;
create policy "Authenticated can read candidates"
  on public.candidate_applications
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert candidates" on public.candidate_applications;
create policy "Authenticated can insert candidates"
  on public.candidate_applications
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update candidates" on public.candidate_applications;
create policy "Authenticated can update candidates"
  on public.candidate_applications
  for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- candidate_activity
-- ---------------------------------------------------------------------

alter table public.candidate_activity enable row level security;

drop policy if exists "Authenticated can read candidate activity" on public.candidate_activity;
create policy "Authenticated can read candidate activity"
  on public.candidate_activity
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert candidate activity" on public.candidate_activity;
create policy "Authenticated can insert candidate activity"
  on public.candidate_activity
  for insert
  to authenticated
  with check (true);

-- Anon can insert activity rows from the public /r/:contributorId
-- referral landing (records the submission event).
drop policy if exists "Anon can insert referral activity" on public.candidate_activity;
create policy "Anon can insert referral activity"
  on public.candidate_activity
  for insert
  to anon
  with check (activity_type = 'referral_submission');

-- ---------------------------------------------------------------------
-- contributors
-- ---------------------------------------------------------------------

alter table public.contributors enable row level security;

drop policy if exists "Authenticated can read contributors" on public.contributors;
create policy "Authenticated can read contributors"
  on public.contributors
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert contributors" on public.contributors;
create policy "Authenticated can insert contributors"
  on public.contributors
  for insert
  to authenticated
  with check (true);

-- Anon can read contributors so the public /r/:contributorId landing
-- page can resolve the contributor name from the URL id.
drop policy if exists "Anon can read contributors" on public.contributors;
create policy "Anon can read contributors"
  on public.contributors
  for select
  to anon
  using (true);

-- Anon can insert contributors via the public /join signup page.
drop policy if exists "Anon can self-signup contributors" on public.contributors;
create policy "Anon can self-signup contributors"
  on public.contributors
  for insert
  to anon
  with check (true);
