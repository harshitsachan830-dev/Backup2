insert into public.profiles (id, email, display_name)
select
  id,
  email,
  coalesce(
    raw_user_meta_data ->> 'display_name',
    raw_user_meta_data ->> 'full_name'
  )
from auth.users
on conflict (id) do nothing;
