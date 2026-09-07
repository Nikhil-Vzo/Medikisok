-- ============================================================================
-- MEDIKIOSK — SECURITY HARDENING MIGRATION (SIH26047 Batch 1)
-- ALCOA+ audit-trail hardening: no anonymous/authenticated read of the
-- immutable audit log; admin-only access. Idempotent.
-- ============================================================================

-- Drop the overly-permissive audit policies from init schema
drop policy if exists "Allow select to audit_log for authenticated" on public.audit_log;

-- Only admins may read the audit trail (role check via profiles)
create policy "Admins can view audit_log"
  on public.audit_log for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Keep audit_log strictly append-only: revoke update/delete at grant level
revoke update, delete on public.audit_log from anon, authenticated;

-- Insert stays open to authenticated kiosk/service flows, but never anonymous
drop policy if exists "Allow insert to audit_log" on public.audit_log;
create policy "Authenticated can append audit_log"
  on public.audit_log for insert
  with check (auth.role() = 'authenticated');
