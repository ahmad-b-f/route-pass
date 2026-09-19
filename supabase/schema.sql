-- Route Pass — Supabase schema
-- Run this in your Supabase project's SQL editor before entering the
-- project URL + anon key into the Admin Portal's Settings page.

create extension if not exists "uuid-ossp";

create table if not exists routes (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists buses (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  route_id uuid references routes(id) on delete set null,
  driver_name text,
  qr_secret text not null,
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  roll_no text not null,
  phone text not null unique,
  password_hash text not null,
  bus_id uuid references buses(id) on delete set null,
  paid_days text[] not null default '{}',
  fee_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists scan_logs (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  student_name text not null,
  bus_id uuid references buses(id) on delete cascade,
  bus_label text not null,
  route_name text,
  timestamp timestamptz not null default now(),
  result text not null check (result in ('granted', 'denied')),
  reason text not null,
  day_color text not null
);

create index if not exists scan_logs_student_idx on scan_logs (student_id);
create index if not exists scan_logs_bus_idx on scan_logs (bus_id);
create index if not exists scan_logs_timestamp_idx on scan_logs (timestamp);

-- Row Level Security ---------------------------------------------------
-- This demo build talks to Supabase directly from the browser using
-- only the anon key, so RLS is what stands between "anyone with the
-- URL" and your data. The policies below are intentionally permissive
-- so the admin/student flows work out of the box; tighten them before
-- any real deployment (e.g. restrict student reads/writes to rows
-- matching their own authenticated identity once you move login
-- server-side).

alter table routes enable row level security;
alter table buses enable row level security;
alter table students enable row level security;
alter table scan_logs enable row level security;

create policy "demo_all_routes" on routes for all using (true) with check (true);
create policy "demo_all_buses" on buses for all using (true) with check (true);
create policy "demo_all_students" on students for all using (true) with check (true);
create policy "demo_all_scan_logs" on scan_logs for all using (true) with check (true);
