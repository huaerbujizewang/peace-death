create extension if not exists pgcrypto;

do $$ begin
  create type public.profile_role as enum ('dm', 'player');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.action_kind as enum ('private', 'government');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.action_status as enum ('draft', 'submitted', 'needs_approval', 'approved', 'processed', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.profile_role not null default 'player',
  created_at timestamptz not null default now()
);

create table if not exists public.factions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  short_name text not null,
  faction_type text not null check (faction_type in ('country', 'political')),
  influence numeric not null default 0,
  color text not null default '#666666',
  supporters text[] not null default '{}',
  government_positions integer not null default 0,
  sort_order integer not null default 0
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  is_government boolean not null default true,
  dm_assign_only boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.characters_public (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  gender text,
  age integer,
  ethnicity text not null,
  faith text not null,
  faction_id uuid references public.factions(id),
  public_traits text[] not null default '{}',
  public_background text not null default '',
  active boolean not null default true,
  is_preset boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.character_private (
  character_id uuid primary key references public.characters_public(id) on delete cascade,
  body integer not null default 40,
  willpower integer not null default 40,
  wealth integer not null default 40,
  charm integer not null default 40,
  intellect integer not null default 40,
  prestige integer not null default 20,
  perception integer not null default 40,
  luck integer not null default 45,
  skills jsonb not null default '{"谈判":10,"演讲":10,"写作":10,"法律":10,"会计":10}'::jsonb,
  secret_traits text[] not null default '{}',
  pursuit text,
  scandal_count integer not null default 0,
  scandals jsonb not null default '[]'::jsonb,
  dm_notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.retainers (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters_public(id) on delete cascade,
  name text not null,
  gender text,
  age integer,
  notes text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.retainer_private (
  retainer_id uuid primary key references public.retainers(id) on delete cascade,
  hidden_identity text not null default '',
  dm_notes text not null default ''
);

create table if not exists public.position_assignments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('character', 'retainer')),
  entity_id uuid not null,
  position_id uuid not null references public.positions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, position_id)
);

create table if not exists public.game_state (
  id boolean primary key default true,
  current_turn integer not null default 1,
  max_turns integer not null default 5,
  current_phase text not null default 'turn_start',
  legitimacy_base numeric not null default 12,
  legitimacy_modifier numeric not null default 0,
  economy_status text not null default '一切如常',
  budget_status text not null default '平衡',
  updated_at timestamptz not null default now(),
  constraint game_state_singleton check (id)
);

create table if not exists public.current_policies (
  id uuid primary key default gen_random_uuid(),
  policy_key text not null unique,
  option_key text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.social_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  mood integer not null default 0 check (mood between -2 and 2),
  sort_order integer not null default 0
);

create table if not exists public.foreign_powers (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  patience integer not null default 30
);

create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  turn_number integer not null,
  action_kind public.action_kind not null,
  actor_type text not null check (actor_type in ('character', 'retainer')),
  actor_id uuid not null,
  title text not null default '',
  category text not null default '其他',
  target text not null default '',
  description text not null default '',
  resources text not null default '',
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  non_public_reason text not null default '',
  requires_approval boolean not null default false,
  status public.action_status not null default 'draft',
  approved_by uuid references public.profiles(id),
  result_public text not null default '',
  result_private text not null default '',
  dm_notes text not null default '',
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parliament_votes (
  id uuid primary key default gen_random_uuid(),
  issue text not null,
  turn_number integer not null,
  faction_id uuid not null references public.factions(id) on delete cascade,
  seats integer not null default 0,
  yes_votes integer not null default 0,
  no_votes integer not null default 0,
  abstain_votes integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated by default as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  table_name text not null,
  row_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

create or replace function public.is_dm()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'dm', false)
$$;

create or replace function public.current_phase()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select current_phase from public.game_state where id = true
$$;

create or replace function public.owns_character(character_uuid uuid, user_uuid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.characters_public c
    where c.id = character_uuid and c.owner_id = user_uuid
  )
$$;

create or replace function public.owns_retainer(retainer_uuid uuid, user_uuid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.retainers r
    join public.characters_public c on c.id = r.character_id
    where r.id = retainer_uuid and c.owner_id = user_uuid
  )
$$;

create or replace function public.is_government_head(user_uuid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.position_assignments pa
    join public.positions p on p.id = pa.position_id
    left join public.characters_public c on pa.entity_type = 'character' and c.id = pa.entity_id
    left join public.retainers r on pa.entity_type = 'retainer' and r.id = pa.entity_id
    left join public.characters_public rc on rc.id = r.character_id
    where p.key in ('duke', 'prime_minister')
      and (c.owner_id = user_uuid or rc.owner_id = user_uuid)
  )
$$;

create or replace function public.delete_character(character_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_uuid uuid;
begin
  select owner_id into owner_uuid
  from public.characters_public
  where id = character_uuid;

  if owner_uuid is null then
    raise exception 'character not found';
  end if;

  if owner_uuid <> auth.uid() and not public.is_dm() then
    raise exception 'not allowed';
  end if;

  delete from public.position_assignments
  where (entity_type = 'character' and entity_id = character_uuid)
     or (entity_type = 'retainer' and entity_id in (
       select id from public.retainers where character_id = character_uuid
     ));

  delete from public.characters_public
  where id = character_uuid;
end;
$$;

grant execute on function public.delete_character(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.factions enable row level security;
alter table public.positions enable row level security;
alter table public.characters_public enable row level security;
alter table public.character_private enable row level security;
alter table public.retainers enable row level security;
alter table public.retainer_private enable row level security;
alter table public.position_assignments enable row level security;
alter table public.game_state enable row level security;
alter table public.current_policies enable row level security;
alter table public.social_groups enable row level security;
alter table public.foreign_powers enable row level security;
alter table public.actions enable row level security;
alter table public.parliament_votes enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles for select to authenticated using (true);
drop policy if exists "dm manages profiles" on public.profiles;
create policy "dm manages profiles" on public.profiles for all to authenticated using (public.is_dm()) with check (public.is_dm());

drop policy if exists "reference readable" on public.factions;
create policy "reference readable" on public.factions for select to authenticated using (true);
drop policy if exists "dm manages factions" on public.factions;
create policy "dm manages factions" on public.factions for all to authenticated using (public.is_dm()) with check (public.is_dm());

drop policy if exists "positions readable" on public.positions;
create policy "positions readable" on public.positions for select to authenticated using (true);
drop policy if exists "dm manages positions" on public.positions;
create policy "dm manages positions" on public.positions for all to authenticated using (public.is_dm()) with check (public.is_dm());

drop policy if exists "characters public readable" on public.characters_public;
create policy "characters public readable" on public.characters_public for select to authenticated using (true);
drop policy if exists "owners create characters" on public.characters_public;
create policy "owners create characters" on public.characters_public for insert to authenticated with check (owner_id = auth.uid() or public.is_dm());
drop policy if exists "owners update own characters" on public.characters_public;
create policy "owners update own characters" on public.characters_public for update to authenticated using (owner_id = auth.uid() or public.is_dm()) with check (owner_id = auth.uid() or public.is_dm());

drop policy if exists "private stats readable" on public.character_private;
create policy "private stats readable" on public.character_private for select to authenticated using (public.is_dm() or public.owns_character(character_id));
drop policy if exists "private stats writable" on public.character_private;
create policy "private stats writable" on public.character_private for all to authenticated using (public.is_dm() or public.owns_character(character_id)) with check (public.is_dm() or public.owns_character(character_id));

drop policy if exists "retainers readable" on public.retainers;
create policy "retainers readable" on public.retainers for select to authenticated using (true);
drop policy if exists "retainers writable" on public.retainers;
create policy "retainers writable" on public.retainers for all to authenticated using (public.is_dm() or public.owns_character(character_id)) with check (public.is_dm() or public.owns_character(character_id));

drop policy if exists "retainer private readable" on public.retainer_private;
create policy "retainer private readable" on public.retainer_private for select to authenticated using (public.is_dm() or public.owns_retainer(retainer_id));
drop policy if exists "retainer private writable" on public.retainer_private;
create policy "retainer private writable" on public.retainer_private for all to authenticated using (public.is_dm() or public.owns_retainer(retainer_id)) with check (public.is_dm() or public.owns_retainer(retainer_id));

drop policy if exists "assignments readable" on public.position_assignments;
create policy "assignments readable" on public.position_assignments for select to authenticated using (true);
drop policy if exists "dm manages assignments" on public.position_assignments;
create policy "dm manages assignments" on public.position_assignments for all to authenticated using (public.is_dm()) with check (public.is_dm());

drop policy if exists "state readable" on public.game_state;
create policy "state readable" on public.game_state for select to authenticated using (true);
drop policy if exists "dm manages state" on public.game_state;
create policy "dm manages state" on public.game_state for all to authenticated using (public.is_dm()) with check (public.is_dm());

drop policy if exists "policies readable" on public.current_policies;
create policy "policies readable" on public.current_policies for select to authenticated using (true);
drop policy if exists "dm manages policies" on public.current_policies;
create policy "dm manages policies" on public.current_policies for all to authenticated using (public.is_dm()) with check (public.is_dm());

drop policy if exists "groups readable" on public.social_groups;
create policy "groups readable" on public.social_groups for select to authenticated using (true);
drop policy if exists "dm manages groups" on public.social_groups;
create policy "dm manages groups" on public.social_groups for all to authenticated using (public.is_dm()) with check (public.is_dm());

drop policy if exists "powers readable" on public.foreign_powers;
create policy "powers readable" on public.foreign_powers for select to authenticated using (true);
drop policy if exists "dm manages powers" on public.foreign_powers;
create policy "dm manages powers" on public.foreign_powers for all to authenticated using (public.is_dm()) with check (public.is_dm());

drop policy if exists "actions readable by scope" on public.actions;
create policy "actions readable by scope" on public.actions for select to authenticated using (
  public.is_dm()
  or owner_id = auth.uid()
  or (
    action_kind = 'government'
    and visibility = 'public'
    and status in ('submitted', 'needs_approval', 'approved', 'processed')
  )
  or (
    action_kind = 'government'
    and visibility = 'private'
    and status in ('needs_approval', 'approved', 'processed')
    and public.is_government_head()
  )
);

drop policy if exists "owners insert actions" on public.actions;
create policy "owners insert actions" on public.actions for insert to authenticated with check (
  public.is_dm()
  or (
    owner_id = auth.uid()
    and (
      status = 'draft'
      or (action_kind = 'private' and public.current_phase() = 'private_submission')
      or (action_kind = 'government' and public.current_phase() = 'government_submission')
    )
  )
);

drop policy if exists "owners update unprocessed actions" on public.actions;
create policy "owners update unprocessed actions" on public.actions for update to authenticated using (
  public.is_dm()
  or (owner_id = auth.uid() and status in ('draft', 'submitted', 'needs_approval'))
  or (public.is_government_head() and action_kind = 'government' and status = 'needs_approval')
) with check (
  public.is_dm()
  or (owner_id = auth.uid() and status in ('draft', 'submitted', 'needs_approval'))
  or (public.is_government_head() and action_kind = 'government' and status in ('approved', 'rejected'))
);

drop policy if exists "votes readable" on public.parliament_votes;
create policy "votes readable" on public.parliament_votes for select to authenticated using (true);
drop policy if exists "dm manages votes" on public.parliament_votes;
create policy "dm manages votes" on public.parliament_votes for all to authenticated using (public.is_dm()) with check (public.is_dm());

drop policy if exists "dm reads audit" on public.audit_log;
create policy "dm reads audit" on public.audit_log for select to authenticated using (public.is_dm());
