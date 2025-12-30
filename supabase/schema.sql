create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.event_dates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  date_value date not null
);

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_name text not null,
  available_dates date[] not null,
  created_at timestamptz not null default now()
);

create index on public.event_dates(event_id);
create index on public.responses(event_id);

alter table public.events enable row level security;
alter table public.event_dates enable row level security;
alter table public.responses enable row level security;

create policy "Public events read" on public.events
  for select using (true);

create policy "Public dates read" on public.event_dates
  for select using (true);

create policy "Public responses insert" on public.responses
  for insert with check (true);

create policy "Authenticated responses read" on public.responses
  for select using (auth.role() = 'authenticated');
