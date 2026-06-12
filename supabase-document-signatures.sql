-- Document signatures: one row per signed PDF.
-- The PDF's QR code stores only the verify URL (/verify/<id>); everything
-- needed to verify lives here.

create table if not exists public.document_signatures_kriptografi (
  id uuid primary key default gen_random_uuid(),
  signer_name text not null,
  reason text not null,
  signed_date text not null,        -- YYYY-MM-DD as entered by the signer
  filename text not null,
  doc_hash text not null,           -- sha256 hex of the original (pre-stamp) PDF
  signature text not null,          -- comma-separated RSA ints over the canonical payload
  public_key text not null,         -- "n = ...\ne = ..."
  created_at timestamptz not null default now()
);

alter table public.document_signatures_kriptografi enable row level security;

-- Public app uses the anon key with no auth, like the chat tables.
drop policy if exists "doc_sig_public_read" on public.document_signatures_kriptografi;
create policy "doc_sig_public_read"
  on public.document_signatures_kriptografi
  for select using (true);

drop policy if exists "doc_sig_public_insert" on public.document_signatures_kriptografi;
create policy "doc_sig_public_insert"
  on public.document_signatures_kriptografi
  for insert with check (true);
