-- ShoePro Manager — Supabase Database Schema
-- Run this in the Supabase SQL Editor

-- 1. Profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text not null,
  role text not null check (role in ('admin', 'supervisor', 'storekeeper')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "read profiles" on public.profiles for select using (auth.role() = 'authenticated');
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'storekeeper');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Staff
create table public.staff (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  role text,
  department text,
  phone text,
  email text,
  is_active boolean default true,
  notes text,
  created_at timestamptz default now()
);
alter table public.staff enable row level security;
create policy "read staff" on public.staff for select using (auth.role() = 'authenticated');
create policy "write staff" on public.staff for all using (auth.role() = 'authenticated');

-- 3. Production Batches
create table public.production_batches (
  id uuid default gen_random_uuid() primary key,
  batch_number text not null unique,
  shoe_model text not null,
  shoe_type text,
  quantity integer not null check (quantity > 0),
  size_range text,
  color text,
  status text not null default 'cutting'
    check (status in ('cutting','stitching','lasting','finishing','packaged','cancelled')),
  assigned_to uuid references public.staff(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.production_batches enable row level security;
create policy "read batches" on public.production_batches for select using (auth.role() = 'authenticated');
create policy "write batches" on public.production_batches for all using (auth.role() = 'authenticated');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger set_batches_updated_at before update on public.production_batches
  for each row execute procedure public.set_updated_at();

-- 4. Raw Materials
create table public.raw_materials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,
  quantity numeric not null default 0 check (quantity >= 0),
  unit text not null default 'units',
  reorder_level numeric not null default 0,
  supplier text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.raw_materials enable row level security;
create policy "read materials" on public.raw_materials for select using (auth.role() = 'authenticated');
create policy "write materials" on public.raw_materials for all using (auth.role() = 'authenticated');
create trigger set_materials_updated_at before update on public.raw_materials
  for each row execute procedure public.set_updated_at();

-- After setup: promote your account to admin
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
