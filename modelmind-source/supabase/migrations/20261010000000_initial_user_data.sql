create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  project_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(project_data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id)
);

create index projects_user_updated_idx
  on public.projects (user_id, updated_at desc);

create table public.datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  project_id uuid,
  file_name text not null check (char_length(file_name) between 1 and 255),
  storage_path text not null unique,
  content_type text,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now(),
  foreign key (user_id, project_id)
    references public.projects (user_id, id) on delete cascade,
  check (split_part(storage_path, '/', 1) = user_id::text)
);

create index datasets_user_created_idx
  on public.datasets (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.datasets enable row level security;

revoke all on public.profiles, public.projects, public.datasets
  from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.datasets to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can manage their own projects"
  on public.projects for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own dataset metadata"
  on public.datasets for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name'
    )
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.create_profile_for_auth_user();

insert into storage.buckets (id, name, public, file_size_limit)
values ('user-datasets', 'user-datasets', false, 104857600)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit;

create policy "Users can read their own dataset files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-datasets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can upload their own dataset files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-datasets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own dataset files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'user-datasets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'user-datasets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own dataset files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-datasets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
