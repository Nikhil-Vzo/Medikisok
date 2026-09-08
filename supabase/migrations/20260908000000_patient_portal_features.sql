-- ============================================================================
-- MEDIKIOSK — PATIENT PORTAL 4-FEATURE EXTENSION MIGRATION
-- Adds dedicated tables for:
--   1. Prescriptions (Feature 2)
--   2. Lab Reports (Feature 2)
--   3. Hospital Departments & Roster (Feature 4)
--   4. Queue enhancements on public.visits (Feature 3)
-- Compliant with ABDM FHIR R4 & DPDP Act 2023
-- ============================================================================

-- 1. EXTEND VISITS TABLE WITH REAL-TIME QUEUE COLUMNS (Feature 3)
do $$ begin
  alter table public.visits add column if not exists token_number int;
  alter table public.visits add column if not exists assigned_room text;
  alter table public.visits add column if not exists assigned_doctor text;
  alter table public.visits add column if not exists queue_status text default 'waiting';
exception
  when others then null;
end $$;

-- 2. DEDICATED PRESCRIPTIONS TABLE (Feature 2)
create table if not exists public.prescriptions (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid references public.profiles(id) on delete cascade,
  visit_id        uuid references public.visits(id) on delete set null,
  name            text not null,
  dosage          text not null,
  frequency       text not null,
  duration        text not null,
  category        text default 'allopathy' check (category in ('allopathy', 'ayurveda', 'ayush', 'unani', 'siddha', 'homeopathy')),
  prescribed_by   text not null,
  hospital        text default 'All India Institute of Ayurveda (AIIA)',
  date            date default current_date,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

-- 3. DEDICATED LAB REPORTS TABLE (Feature 2)
create table if not exists public.lab_reports (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid references public.profiles(id) on delete cascade,
  visit_id        uuid references public.visits(id) on delete set null,
  test_name       text not null,
  test_value      text not null,
  unit            text not null,
  normal_range    text not null,
  status          text default 'normal' check (status in ('normal', 'high', 'low', 'critical')),
  date            date default current_date,
  created_at      timestamptz default now()
);

-- 4. HOSPITAL DEPARTMENTS & SPECIALITY ROSTER (Feature 4)
create table if not exists public.hospital_departments (
  id                uuid primary key default gen_random_uuid(),
  department_name   text not null,
  category          text default 'ayurveda',
  room_number       text not null,
  doctor_in_charge  text not null,
  status            text default 'active' check (status in ('active', 'break', 'closed')),
  timings           text default '09:00 AM - 02:00 PM',
  created_at        timestamptz default now()
);

-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
alter table public.prescriptions enable row level security;
alter table public.lab_reports enable row level security;
alter table public.hospital_departments enable row level security;

-- Public/Kiosk read policies (ABHA anonymous and authenticated)
drop policy if exists "Prescriptions readable by patient or kiosk" on public.prescriptions;
create policy "Prescriptions readable by patient or kiosk"
  on public.prescriptions for select
  using (auth.uid() = patient_id or auth.uid() is null);

drop policy if exists "Prescriptions insertable by doctor or kiosk" on public.prescriptions;
create policy "Prescriptions insertable by doctor or kiosk"
  on public.prescriptions for insert
  with check (true);

drop policy if exists "Lab reports readable by patient or kiosk" on public.lab_reports;
create policy "Lab reports readable by patient or kiosk"
  on public.lab_reports for select
  using (auth.uid() = patient_id or auth.uid() is null);

drop policy if exists "Lab reports insertable by doctor or kiosk" on public.lab_reports;
create policy "Lab reports insertable by doctor or kiosk"
  on public.lab_reports for insert
  with check (true);

drop policy if exists "Hospital departments readable by all" on public.hospital_departments;
create policy "Hospital departments readable by all"
  on public.hospital_departments for select
  using (true);

-- 6. SEED DATA FOR DEMO HOSPITAL DEPARTMENTS
insert into public.hospital_departments (department_name, category, room_number, doctor_in_charge, status, timings)
values
  ('Kayachikitsa (Ayurveda OPD)', 'ayurveda', 'Room 104', 'Dr. Ananya Sharma (MD Ayur)', 'active', '09:00 AM - 02:00 PM'),
  ('General Medicine (Allopathy OPD)', 'allopathy', 'Room 102', 'Dr. Rajesh Mehra (MD Gen Med)', 'active', '08:30 AM - 03:00 PM'),
  ('Panchakarma Unit', 'ayurveda', 'Room 108', 'Dr. P. K. Namboodiri', 'active', '09:30 AM - 01:30 PM'),
  ('Shalya Tantra (Surgical OPD)', 'ayurveda', 'Room 105', 'Dr. Ramanathan Swamy', 'active', '10:00 AM - 02:00 PM'),
  ('Casualty / 24x7 Emergency', 'emergency', 'Ground Floor Red Zone', 'Dr. Priya V. (Emergency Officer)', 'active', '24 Hours')
on conflict do nothing;
