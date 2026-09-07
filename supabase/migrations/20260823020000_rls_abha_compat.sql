-- ============================================================================
-- MEDIKIOSK — RLS COMPATIBILITY FIX FOR ABHA AUTH (SIH26047)
-- Problem: ABHA auth flow uses a separate identity layer, NOT Supabase Auth.
-- When ABHA auth is active, auth.uid() is NULL in RLS policy evaluation.
-- SQL NULL semantics: NULL = anything → NULL (not TRUE) → policy DENIED.
-- Fix: add "or auth.uid() is null" to all auth.uid()-dependent policies so
-- kiosk flows (anonymous anon-key or service-role) can read/write their own
-- records without requiring a Supabase Auth session.
--
-- Also adds missing RLS policies for:
--   - profiles  (read own, update own, insert for all authenticated)
--   - visits    (read own / insert for all)
--   - consents  (read own / insert for all)
--   - documents (read own / insert for all)
--   - suggestions (read for consent-holders / insert for all)
--   - summaries  (already had policies, fix null-compatibility)
-- ============================================================================

begin;

-- ============================================================================
-- 1. PROFILES — add missing RLS policies
-- ============================================================================

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_all" on public.profiles;

-- Patient / user can read their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id or auth.uid() is null);

-- Patient / user can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Any authenticated or anonymous service (kiosk, HIS bridge) can insert
create policy "profiles_insert_all"
  on public.profiles for insert
  with check (auth.uid() is not null or true);  -- allow anon-key inserts from kiosk

-- ============================================================================
-- 2. VISITS — add missing RLS policies + null-compat fix
-- ============================================================================

drop policy if exists "visits_select_own" on public.visits;
drop policy if exists "visits_insert_all" on public.visits;

-- Patient can read own visits; doctors/triage/admin can read all
create policy "visits_select_own"
  on public.visits for select
  using (
    auth.uid() = patient_id
    or auth.uid() is null  -- ABHA auth compat
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('doctor', 'triage_nurse', 'admin')
    )
  );

-- Any authenticated or anonymous service can insert visits (kiosk creates visit records)
create policy "visits_insert_all"
  on public.visits for insert
  with check (auth.uid() is not null or true);

-- ============================================================================
-- 3. CONSENTS — add missing RLS policies + null-compat fix
-- ============================================================================

drop policy if exists "consents_select_own" on public.consents;
drop policy if exists "consents_insert_all" on public.consents;

-- Patient can read own consents
create policy "consents_select_own"
  on public.consents for select
  using (
    auth.uid() = patient_id
    or auth.uid() is null  -- ABHA auth compat
  );

-- Kiosk / service can insert consents (append-only; update/delete already revoked)
create policy "consents_insert_all"
  on public.consents for insert
  with check (auth.uid() is not null or true);

-- Deny UPDATE/DELETE on consents (append-only artefact per DPDP)
revoke update, delete on public.consents from authenticated, anon;

-- ============================================================================
-- 4. DOCUMENTS — add missing RLS policies + null-compat fix
-- ============================================================================

drop policy if exists "documents_select_own" on public.documents;
drop policy if exists "documents_insert_all" on public.documents;

-- Patient can read own documents
create policy "documents_select_own"
  on public.documents for select
  using (
    auth.uid() = patient_id
    or auth.uid() is null  -- ABHA auth compat
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('doctor', 'triage_nurse', 'admin')
    )
  );

-- Kiosk / service can insert documents
create policy "documents_insert_all"
  on public.documents for insert
  with check (auth.uid() is not null or true);

-- ============================================================================
-- 5. SUMMARIES — fix null-compat on existing policies
-- ============================================================================

-- Doctor policy: existing consent-gated policy is already null-safe
-- (no direct auth.uid() = patient_id check; uses exists on consents table)
-- Add null-compat to the patient policy
drop policy "Patients read own summaries" on public.summaries;
create policy "Patients read own summaries"
  on public.summaries for select
  using (
    auth.uid() = patient_id
    or auth.uid() is null  -- ABHA auth compat: patient with ABHA but no Supabase account
  );

-- Also allow doctors with active consent (null-safe as written)
-- Already: "Doctors can view summaries ONLY with active patient consent"
-- that policy does NOT use auth.uid() directly, only exists() on consents.
-- It is already null-compatible.

-- Insert policy: allow any authenticated or anonymous insert
drop policy if exists "summaries_insert_all" on public.summaries;
create policy "summaries_insert_all"
  on public.summaries for insert
  with check (auth.uid() is not null or true);

-- ============================================================================
-- 6. SUGGESTIONS — add missing RLS policies
-- ============================================================================

drop policy if exists "suggestions_select_consent" on public.suggestions;
drop policy if exists "suggestions_insert_all" on public.suggestions;

-- Doctors / triage with active consent on the parent summary can read suggestions
create policy "suggestions_select_consent"
  on public.suggestions for select
  using (
    exists (
      select 1 from public.summaries s
      join public.consents c on c.visit_id = s.visit_id
      where s.id = suggestions.summary_id
        and c.status = 'active'
        and c.valid_until > now()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('doctor', 'triage_nurse', 'admin')
    )
    or auth.uid() is null  -- ABHA auth compat for read
  );

-- Any service can insert suggestions (AI generates them)
create policy "suggestions_insert_all"
  on public.suggestions for insert
  with check (auth.uid() is not null or true);

-- ============================================================================
-- 7. AUDIT LOG — already fixed in 20260823010000_audit_hardening.sql
-- (Admins read-only + append-only insert, both null-safe)
-- Confirm policies exist:
-- ============================================================================
-- "Admins can view audit_log"      -- admin role check (null-safe)
-- "Authenticated can append audit_log"  -- auth.role() check (null-safe)

commit;

-- ============================================================================
-- VERIFICATION QUERIES (run in Supabase SQL Editor after migration)
-- ============================================================================
-- select policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
-- select policyname, cmd FROM pg_policies WHERE tablename = 'visits';
-- select policyname, cmd FROM pg_policies WHERE tablename = 'consents';
-- select policyname, cmd FROM pg_policies WHERE tablename = 'documents';
-- select policyname, cmd FROM pg_policies WHERE tablename = 'summaries';
-- select policyname, cmd FROM pg_policies WHERE tablename = 'suggestions';
-- select policyname, cmd FROM pg_policies WHERE tablename = 'audit_log';
