-- Contributors table: structured identity for people who refer candidates.
-- Replaces the free-text candidate_applications.referred_by column. The text
-- column stays during transition so legacy rows that don't backfill cleanly
-- still render.

create table if not exists contributors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists contributors_name_idx on contributors (lower(name));

alter table candidate_applications
  add column if not exists referred_by_id uuid references contributors(id);

create index if not exists candidate_applications_referred_by_id_idx
  on candidate_applications (referred_by_id);

-- Auto-backfill: one contributor row per distinct non-empty referred_by string.
-- Case-insensitive grouping so "Jane Smith" and "jane smith" collapse to one row.
with distinct_names as (
  select distinct trim(referred_by) as name
  from candidate_applications
  where referred_by is not null
    and trim(referred_by) <> ''
)
insert into contributors (name)
select dn.name
from distinct_names dn
where not exists (
  select 1 from contributors c
  where lower(c.name) = lower(dn.name)
);

update candidate_applications ca
set referred_by_id = c.id
from contributors c
where ca.referred_by_id is null
  and ca.referred_by is not null
  and lower(trim(ca.referred_by)) = lower(c.name);
