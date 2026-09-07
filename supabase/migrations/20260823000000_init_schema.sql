-- ============================================================================
-- MEDIKIOSK — PRODUCTION SUPABASE SCHEMA DDL (SIH26047)
-- Ministry of Ayush → All India Institute of Ayurveda (AIIA)
-- Compliant with DPDP Act 2023 & ABDM FHIR R4 Interoperability
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
do $$ begin
  create type user_role_enum as enum ('patient', 'doctor', 'triage_nurse', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type interview_depth_enum as enum ('full', 'delta', 'triage_only');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type summary_status_enum as enum ('draft', 'approved', 'amended', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type suggestion_type_enum as enum ('redflag', 'interaction', 'abnormal_lab', 'ayush_dosha_insight');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type consent_status_enum as enum ('active', 'revoked', 'expired');
exception
  when duplicate_object then null;
end $$;

-- 3. PROFILES / USERS TABLE
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  role user_role_enum not null default 'patient',
  abha_id varchar(17) unique,
  full_name text not null,
  age int,
  gender text,
  preferred_language varchar(10) default 'hi',
  phone varchar(15),
  created_at timestamptz default now()
);

-- 4. VISITS TABLE
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  visit_date timestamptz default now(),
  gap_days int default 0,
  interview_type interview_depth_enum not null default 'full',
  is_emergency boolean default false,
  chief_complaint text,
  clinical_mode text default 'allopathy',
  created_at timestamptz default now()
);

-- 5. CONSENTS TABLE (DPDP Act 2023 Compliant)
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits(id) on delete cascade,
  patient_id uuid not null references public.profiles(id),
  doctor_id uuid references public.profiles(id),
  purpose text not null default 'OPD Clinical Consultation & Case-Taking',
  status consent_status_enum not null default 'active',
  granted_at timestamptz default now(),
  valid_until timestamptz default (now() + interval '24 hours'),
  audio_consent_verified boolean default true
);

-- 6. SCANNED DOCUMENTS & OCR ENTITIES
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits(id) on delete cascade,
  patient_id uuid not null references public.profiles(id),
  file_url text not null,
  doc_type text default 'prescription',
  document_date date,
  raw_ocr_text text,
  extracted_entities jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 7. STRUCTURED CLINICAL SUMMARIES
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits(id) on delete cascade,
  patient_id uuid not null references public.profiles(id),
  draft_summary jsonb not null,
  final_summary jsonb,
  fhir_bundle jsonb not null,
  status summary_status_enum not null default 'draft',
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- 8. CLINICAL SUGGESTIONS & SAFETY ALERTS
create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  summary_id uuid not null references public.summaries(id) on delete cascade,
  type suggestion_type_enum not null,
  title text not null,
  description text not null,
  confidence_score float check (confidence_score between 0.0 and 1.0),
  cited_source text,
  created_at timestamptz default now()
);

-- 9. ALCOA+ IMMUTABLE AUDIT LOG
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb,
  ip_address text,
  timestamp timestamptz default now() not null
);

-- 10. ROW-LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.visits enable row level security;
alter table public.consents enable row level security;
alter table public.documents enable row level security;
alter table public.summaries enable row level security;
alter table public.suggestions enable row level security;
alter table public.audit_log enable row level security;

-- Drop existing policies if needed
drop policy if exists "Doctors can view summaries ONLY with active patient consent" on public.summaries;
drop policy if exists "Patients read own summaries" on public.summaries;
drop policy if exists "Allow insert to audit_log" on public.audit_log;

-- Consent-Gated Doctor Read Policy for Summaries:
create policy "Doctors can view summaries ONLY with active patient consent"
  on public.summaries for select
  using (
    auth.uid() = patient_id
    or exists (
      select 1 from public.consents c
      where c.visit_id = summaries.visit_id
        and (c.doctor_id = auth.uid() or c.doctor_id is null)
        and c.status = 'active'
        and c.valid_until > now()
    )
  );

-- Patients can view their own summaries:
create policy "Patients read own summaries"
  on public.summaries for select
  using (auth.uid() = patient_id);

-- Strict Immutability on Audit Log:
revoke update, delete on public.audit_log from public, authenticated, anon;
create policy "Allow insert to audit_log"
  on public.audit_log for insert with check (true);
create policy "Allow select to audit_log for authenticated"
  on public.audit_log for select using (true);
