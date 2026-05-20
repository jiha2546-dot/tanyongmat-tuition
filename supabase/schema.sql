-- ============================================================
-- Tanyongmat Tuition Center — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── USERS (managed by Supabase Auth) ────────────────────────
-- Roles: admin (Teh Ming), hannan, tutor, outside
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('admin','hannan','tutor','outside')),
  name text not null,
  phone text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
-- Allow admin and hannan to read all profiles
create policy "Admin/Hannan read all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','hannan'))
);

-- ── STUDENTS ────────────────────────────────────────────────
create table public.students (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  age int not null,
  level text not null,
  school text not null default 'Laemthong',
  notes text,
  join_date date not null default current_date,
  created_at timestamptz default now()
);
alter table public.students enable row level security;
create policy "Admin/Hannan/Tutor can read students" on public.students for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','hannan','tutor'))
);
create policy "Admin can insert/update students" on public.students for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── ENROLLMENTS (one per student per subject/course) ────────
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students on delete cascade not null,
  subject text not null,
  tutor text not null,
  type text not null check (type in ('course','hourly')),
  course_type text check (course_type in ('1on1','small group','group')),
  amount numeric not null default 0,
  paid boolean not null default false,
  pay_date date,
  pay_method text,
  evidence_url text,  -- Supabase Storage URL
  notes text,
  created_at timestamptz default now()
);
alter table public.enrollments enable row level security;
create policy "Admin/Hannan/Tutor can read enrollments" on public.enrollments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','hannan','tutor'))
);
create policy "Admin can manage enrollments" on public.enrollments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── BOOKINGS ────────────────────────────────────────────────
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('outside','our')),
  booker_name text not null,
  booker_phone text,
  tutor_name text,
  subject text,
  table_name text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  hours numeric not null default 1,
  num_students int not null default 1,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  paid boolean not null default false,
  amount numeric not null default 20,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);
alter table public.bookings enable row level security;
-- Outside users can insert their own bookings
create policy "Anyone can insert bookings" on public.bookings for insert with check (true);
-- Outside users can read/update their own bookings
create policy "Outside users manage own bookings" on public.bookings for all using (created_by = auth.uid());
-- Admin/Hannan/Tutor can read all bookings
create policy "Admin/Hannan/Tutor read all bookings" on public.bookings for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','hannan','tutor'))
);
-- Admin can update/delete all bookings
create policy "Admin can manage all bookings" on public.bookings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── WORK LOG ─────────────────────────────────────────────────
create table public.work_log (
  id uuid default uuid_generate_v4() primary key,
  date date not null default current_date,
  worker_name text not null default 'Teh Ming',
  hours numeric not null,
  shift text not null,
  note text,
  created_at timestamptz default now()
);
alter table public.work_log enable row level security;
create policy "Admin/Hannan read work log" on public.work_log for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','hannan'))
);
create policy "Admin can manage work log" on public.work_log for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── CASH ENTRIES (income) ────────────────────────────────────
create table public.cash_entries (
  id uuid default uuid_generate_v4() primary key,
  date date not null default current_date,
  description text not null,
  amount numeric not null default 0,
  type text not null default 'income' check (type in ('income','expense')),
  category text,
  note text,
  created_at timestamptz default now()
);
alter table public.cash_entries enable row level security;
create policy "Admin/Hannan read cash entries" on public.cash_entries for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','hannan'))
);
create policy "Admin can manage cash entries" on public.cash_entries for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── STORAGE BUCKET for payment evidence ─────────────────────
-- Run this separately in Supabase dashboard → Storage → New bucket
-- Name: evidence
-- Public: false
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- ── STORAGE POLICIES ────────────────────────────────────────
-- In Supabase dashboard → Storage → evidence → Policies, add:
-- 1. INSERT: authenticated users (role = admin)
-- 2. SELECT: authenticated users (role = admin or hannan)
