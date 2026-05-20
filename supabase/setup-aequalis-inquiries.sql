create table if not exists public.aequalis_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  collaboration_type text not null default 'partnership',
  message text not null,
  reference_url text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'replied', 'archived')),
  admin_note text,
  source_path text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aequalis_inquiries_created_at_idx
  on public.aequalis_inquiries (created_at desc);

create index if not exists aequalis_inquiries_status_idx
  on public.aequalis_inquiries (status);

create or replace function public.set_aequalis_inquiries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_aequalis_inquiries_updated_at
  on public.aequalis_inquiries;

create trigger set_aequalis_inquiries_updated_at
before update on public.aequalis_inquiries
for each row
execute function public.set_aequalis_inquiries_updated_at();

alter table public.aequalis_inquiries enable row level security;

-- Public visitors submit through the Next.js API route, which uses the service role.
-- Keep direct browser access closed so inquiries are not readable or writable
-- through the anon key.
drop policy if exists "No anon read for aequalis inquiries"
  on public.aequalis_inquiries;
