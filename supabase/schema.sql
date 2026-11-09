-- =====================================================================
-- supabase/schema.sql
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
-- =====================================================================

-- ============ profiles ============
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Admin check that bypasses RLS (avoids a policy calling itself)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Allows admins to promote/demote users from the admin page.
create or replace function public.set_user_role(target uuid, new_role text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;

  if new_role not in ('user', 'admin') then
    raise exception 'Invalid role';
  end if;

  update public.profiles
  set role = new_role
  where id = target;

  return true;
end;
$$;

grant execute on function public.set_user_role(uuid, text) to authenticated;

-- Role changes are handled by the RPC above, not direct profile updates.
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles: admins read all" on public.profiles;
create policy "profiles: admins read all" on public.profiles
  for select to authenticated
  using (public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Users may change only their name, never their role
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ============ create a profile on sign-up ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ login_activity ============
create table if not exists public.login_activity (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  event      text not null check (event in ('login', 'logout')),
  created_at timestamptz not null default now()
);

create index if not exists login_activity_user_idx
  on public.login_activity (user_id, created_at desc);

alter table public.login_activity enable row level security;

drop policy if exists "activity: insert own" on public.login_activity;
create policy "activity: insert own" on public.login_activity
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "activity: read own" on public.login_activity;
create policy "activity: read own" on public.login_activity
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "activity: admins read all" on public.login_activity;
create policy "activity: admins read all" on public.login_activity
  for select to authenticated
  using (public.is_admin());
