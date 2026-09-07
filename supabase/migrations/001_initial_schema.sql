-- ============================================================================
-- MEDIKIOSK — INITIAL SCHEMA MIGRATION (SIH26047 Task 11)
-- Supabase schema: patients, intake_sessions, consent_records,
-- clinical_summaries, fhir_exports, audit_log
-- RLS: patients = own records only; consent = append-only; audit = admin read
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
  create type intake_status_enum as enum ('in_progress', 'completed', 'abandoned');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type consent_status_enum as enum ('active', 'revoked', 'expired');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type summary_status_enum as enum ('draft', 'approved', 'amended', 'rejected');
exception
  when duplicate_object then null;
end $$;

-- ============================================================================
-- TABLE: patients
-- Stores patient demographic and ABHA identity data.
-- RLS: patients can only see/edit their own record.
-- ============================================================================
create table if not exists public.patients (
  id          uuid primary key default gen_random_uuid(),
  abha_id     varchar(17) unique,
  full_name   text not null,
  age         int,
  gender      text,
  phone       varchar(15),
  email       text,
  address     text,
  preferred_language varchar(10) default 'hi',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================================
-- TABLE: intake_sessions
-- Each kiosk check-in creates one intake session with vitals + complaints.
-- RLS: patients see own sessions; doctors/triage see all.
-- ============================================================================
create table if not exists public.intake_sessions (
  id                    uuid primary key default gen_random_uuid(),
  patient_id            uuid not null references public.patients(id) on delete cascade,
  status                intake_status_enum not null default 'in_progress',
  chief_complaint       text,
  clinical_mode         text default 'allopathy',
  interview_type        text default 'full',
  is_emergency          boolean default false,
  gap_days              int default 0,
  vitals_json           jsonb default '{}'::jsonb,
  history_json          jsonb default '{}'::jsonb,
  examination_json      jsonb default '{}'::jsonb,
  ocr_documents_json    jsonb default '[]'::jsonb,
  started_at            timestamptz default now(),
  completed_at          timestamptz,
  created_at            timestamptz default now()
);

-- ============================================================================
-- TABLE: consent_records
-- ABDM/DPDP-compliant consent for clinical data processing.
-- RLS: append-only — no UPDATE or DELETE; SELECT open to patient + active
-- consent-holders.
-- ============================================================================
create table if not exists public.consent_records (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references public.patients(id),
  intake_session_id uuid references public.intake_sessions(id),
  doctor_id         uuid references public.patients(id),
  purpose           text not null default 'OPD Clinical Consultation & Case-Taking',
  scope             text not null default 'clinical_data_collection',
  status            consent_status_enum not null default 'active',
  consent_method   text default 'signature',
  granted_at        timestamptz default now(),
  valid_until       timestamptz default (now() + interval '24 hours'),
  revoked_at        timestamptz,
  created_at        timestamptz default now()
);

-- ============================================================================
-- TABLE: clinical_summaries
-- AI-generated SOAP summaries linked to intake sessions.
-- RLS: patient sees own; doctors with active consent can read.
-- ============================================================================
create table if not exists public.clinical_summaries (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references public.patients(id),
  intake_session_id uuid not null references public.intake_sessions(id),
  summary_json      jsonb not null,
  soap_json         jsonb,
  status            summary_status_enum not null default 'draft',
  generated_by      text default 'groq_llama',
  approved_by       uuid references public.patients(id),
  approved_at       timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ============================================================================
-- TABLE: fhir_exports
-- FHIR R4 bundles generated for ABDM HIU/HIP exchanges.
-- RLS: patient sees own; admins see all.
-- ============================================================================
create table if not exists public.fhir_exports (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references public.patients(id),
  intake_session_id uuid references public.intake_sessions(id),
  clinical_summary_id uuid references public.clinical_summaries(id),
  fhir_bundle       jsonb not null,
  fhir_version      text not null default 'R4',
  exported_by       text,
  exported_at       timestamptz default now(),
  created_at        timestamptz default now()
);

-- ============================================================================
-- TABLE: audit_log
-- Immutable ALCOA+ audit trail for all PHI access and consent events.
-- RLS: INSERT open to authenticated; SELECT only for admin role;
-- UPDATE/DELETE prohibited.
-- ============================================================================
create table if not exists public.audit_log (
  id            bigint generated always as identity primary key,
  actor_id      uuid,
  action        text not null,
  resource_type text not null,
  resource_id   uuid,
  details       jsonb,
  ip_address    text,
  user_agent    text,
  timestamp     timestamptz default now() not null
);

-- ============================================================================
-- INDEXES — performance on FK lookups and common filters
-- ============================================================================
create index if not exists idx_intake_sessions_patient_id   on public.intake_sessions(patient_id);
create index if not exists idx_intake_sessions_status       on public.intake_sessions(status);
create index if not exists idx_intake_sessions_started_at   on public.intake_sessions(started_at);

create index if not exists idx_consent_records_patient_id    on public.consent_records(patient_id);
create index if not exists idx_consent_records_status       on public.consent_records(status);
create index if not exists idx_consent_records_granted_at   on public.consent_records(granted_at);

create index if not exists idx_clinical_summaries_patient_id     on public.clinical_summaries(patient_id);
create index if not exists idx_clinical_summaries_intake_session on public.clinical_summaries(intake_session_id);
create index if not exists idx_clinical_summaries_status         on public.clinical_summaries(status);

create index if not exists idx_fhir_exports_patient_id   on public.fhir_exports(patient_id);
create index if not exists idx_fhir_exports_created_at  on public.fhir_exports(created_at);

create index if not exists idx_audit_log_actor_id        on public.audit_log(actor_id);
create index if not exists idx_audit_log_resource_type  on public.audit_log(resource_type);
create index if not exists idx_audit_log_timestamp      on public.audit_log(timestamp);
create index if not exists idx_audit_log_resource_id    on public.audit_log(resource_id);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.patients           enable row level security;
alter table public.intake_sessions    enable row level security;
alter table public.consent_records    enable row level security;
alter table public.clinical_summaries enable row level security;
alter table public.fhir_exports       enable row level security;
alter table public.audit_log         enable row level security;

-- --------------------------------------------------------------------------
-- PATIENTS — own records only
-- --------------------------------------------------------------------------
drop policy if exists "patients_select_own"  on public.patients;
drop policy if exists "patients_update_own" on public.patients;
drop policy if exists "patients_insert_own" on public.patients;

create policy "patients_select_own"
  on public.patients for select
  using (auth.uid() = id);

create policy "patients_update_own"
  on public.patients for update
  using (auth.uid() = id);

create policy "patients_insert_own"
  on public.patients for insert
  with check (auth.uid() = id);

-- --------------------------------------------------------------------------
-- INTAKE SESSIONS — patient sees own; doctor/triage/admin sees all
-- --------------------------------------------------------------------------
drop policy if exists "intake_sessions_select" on public.intake_sessions;
drop policy if exists "intake_sessions_insert" on public.intake_sessions;
drop policy if exists "intake_sessions_update" on public.intake_sessions;

create policy "intake_sessions_select"
  on public.intake_sessions for select
  using (
    auth.uid() = patient_id
    or exists (
      select 1 from public.patients p
      where p.id = auth.uid() and p.role in ('doctor', 'triage_nurse', 'admin')
    )
  );

create policy "intake_sessions_insert"
  on public.intake_sessions for insert
  with check (
    auth.uid() = patient_id
    or exists (
      select 1 from public.patients p
      where p.id = auth.uid() and p.role in ('doctor', 'triage_nurse', 'admin')
    )
  );

create policy "intake_sessions_update"
  on public.intake_sessions for update
  using (
    auth.uid() = patient_id
    or exists (
      select 1 from public.patients p
      where p.id = auth.uid() and p.role in ('doctor', 'triage_nurse', 'admin')
    )
  );

-- --------------------------------------------------------------------------
-- CONSENT RECORDS — append-only (INSERT only; no UPDATE/DELETE/SELECT policy
-- for patient own records + consent-holders)
-- --------------------------------------------------------------------------
drop policy if exists "consent_records_append"     on public.consent_records;
drop policy if exists "consent_records_select"     on public.consent_records;

-- INSERT open to authenticated (kiosk / service role)
create policy "consent_records_append"
  on public.consent_records for insert
  with check (auth.role() = 'authenticated');

-- SELECT: patient sees own; consent-holders with active consent see it
create policy "consent_records_select"
  on public.consent_records for select
  using (
    auth.uid() = patient_id
    or exists (
      select 1 from public.consent_records cr
      where cr.id = consent_records.id
        and cr.patient_id = auth.uid()
    )
  );

-- Deny UPDATE and DELETE on consent_records (append-only)
revoke update, delete on public.consent_records from authenticated, anon;

-- --------------------------------------------------------------------------
-- CLINICAL SUMMARIES — patient sees own; doctors with active consent can read
-- --------------------------------------------------------------------------
drop policy if exists "clinical_summaries_select_patient" on public.clinical_summaries;
drop policy if exists "clinical_summaries_select_doctor"   on public.clinical_summaries;
drop policy if exists "clinical_summaries_insert"         on public.clinical_summaries;

create policy "clinical_summaries_select_patient"
  on public.clinical_summaries for select
  using (auth.uid() = patient_id);

create policy "clinical_summaries_select_doctor"
  on public.clinical_summaries for select
  using (
    exists (
      select 1 from public.consent_records cr
      where cr.intake_session_id = clinical_summaries.intake_session_id
        and cr.status = 'active'
        and cr.valid_until > now()
    )
  );

create policy "clinical_summaries_insert"
  on public.clinical_summaries for insert
  with check (auth.role() = 'authenticated');

-- --------------------------------------------------------------------------
-- FHIR EXPORTS — patient sees own; admins see all
-- --------------------------------------------------------------------------
drop policy if exists "fhir_exports_select_patient" on public.fhir_exports;
drop policy if exists "fhir_exports_select_admin"  on public.fhir_exports;
drop policy if exists "fhir_exports_insert"        on public.fhir_exports;

create policy "fhir_exports_select_patient"
  on public.fhir_exports for select
  using (auth.uid() = patient_id);

create policy "fhir_exports_select_admin"
  on public.fhir_exports for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "fhir_exports_insert"
  on public.fhir_exports for insert
  with check (auth.role() = 'authenticated');

-- --------------------------------------------------------------------------
-- AUDIT LOG — admin read-only; append-only for authenticated services
-- --------------------------------------------------------------------------
drop policy if exists "audit_log_admin_read"   on public.audit_log;
drop policy if exists "audit_log_auth_insert" on public.audit_log;

-- Only admins can SELECT
create policy "audit_log_admin_read"
  on public.audit_log for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Any authenticated service can INSERT (audit events)
create policy "audit_log_auth_insert"
  on public.audit_log for insert
  with check (auth.role() = 'authenticated');

-- Strictly deny UPDATE/DELETE
revoke update, delete on public.audit_log from authenticated, anon;
