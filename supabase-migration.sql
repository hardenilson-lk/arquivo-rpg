-- Rode este arquivo no SQL Editor do Supabase se alguma coluna/tabela ainda nao existir.
-- Ele usa apenas dados publicos do app e NAO usa service_role, senha do banco ou connection string.

create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id uuid primary key,
  username text unique not null,
  email text unique,
  role text default 'player',
  password_hash text,
  sheet_ids uuid[] default '{}',
  campaign_ids uuid[] default '{}',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.campanhas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  mestre_id uuid,
  nome text,
  codigo_convite text,
  invite_code text,
  sistema_regra text default 'arquivo',
  theme_key text default 'theme-arquivo',
  objetivo_atual text,
  local_atual text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.personagens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  campanha_id uuid,
  nome text,
  jogador text,
  atributos jsonb default '{}'::jsonb,
  pericias jsonb default '{}'::jsonb,
  vida jsonb default '{}'::jsonb,
  sanidade jsonb default '{}'::jsonb,
  payload jsonb default '{}'::jsonb,
  sistema_regra text default 'arquivo',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.inventario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  personagem_id uuid,
  nome text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.anotacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  personagem_id uuid,
  campanha_id uuid,
  titulo text,
  conteudo text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.rolagens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  campanha_id uuid,
  personagem_id uuid,
  formula text,
  resultado text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.grid_tokens (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null,
  cena_id text not null,
  personagem_id uuid,
  nome text,
  imagem_url text,
  x integer default 0,
  y integer default 0,
  largura numeric default 1,
  altura numeric default 1,
  rotacao numeric default 0,
  visivel boolean default true,
  bloqueado boolean default false,
  updated_by uuid,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.campanhas add column if not exists owner_id uuid;
alter table public.campanhas add column if not exists mestre_id uuid;
alter table public.campanhas add column if not exists nome text;
alter table public.campanhas add column if not exists codigo_convite text;
alter table public.campanhas add column if not exists invite_code text;
alter table public.campanhas add column if not exists sistema_regra text default 'arquivo';
alter table public.campanhas add column if not exists theme_key text default 'theme-arquivo';
alter table public.campanhas add column if not exists objetivo_atual text;
alter table public.campanhas add column if not exists local_atual text;
alter table public.campanhas add column if not exists payload jsonb default '{}'::jsonb;
alter table public.campanhas add column if not exists created_at timestamptz default now();
alter table public.campanhas add column if not exists updated_at timestamptz default now();

alter table public.usuarios alter column email drop not null;
alter table public.usuarios add column if not exists password_hash text;
alter table public.usuarios add column if not exists sheet_ids uuid[] default '{}';
alter table public.usuarios add column if not exists campaign_ids uuid[] default '{}';

alter table public.personagens add column if not exists user_id uuid;
alter table public.personagens add column if not exists campanha_id uuid;
alter table public.personagens add column if not exists nome text;
alter table public.personagens add column if not exists jogador text;
alter table public.personagens add column if not exists atributos jsonb default '{}'::jsonb;
alter table public.personagens add column if not exists pericias jsonb default '{}'::jsonb;
alter table public.personagens add column if not exists vida jsonb default '{}'::jsonb;
alter table public.personagens add column if not exists sanidade jsonb default '{}'::jsonb;
alter table public.personagens add column if not exists payload jsonb default '{}'::jsonb;
alter table public.personagens add column if not exists sistema_regra text default 'arquivo';
alter table public.personagens add column if not exists created_at timestamptz default now();
alter table public.personagens add column if not exists updated_at timestamptz default now();

alter table public.inventario add column if not exists user_id uuid;
alter table public.inventario add column if not exists personagem_id uuid;
alter table public.inventario add column if not exists nome text;
alter table public.inventario add column if not exists payload jsonb default '{}'::jsonb;
alter table public.inventario add column if not exists created_at timestamptz default now();
alter table public.inventario add column if not exists updated_at timestamptz default now();

-- D&D 5e: campos dedicados para inventario/equipamentos setorizados.
alter table public.inventario add column if not exists campanha_id uuid;
alter table public.inventario add column if not exists categoria text;
alter table public.inventario add column if not exists subtipo text;
alter table public.inventario add column if not exists quantidade integer default 1;
alter table public.inventario add column if not exists peso text;
alter table public.inventario add column if not exists equipado boolean default false;
alter table public.inventario add column if not exists arma_em_punho boolean default false;
alter table public.inventario add column if not exists armadura_em_uso boolean default false;
alter table public.inventario add column if not exists escudo_em_uso boolean default false;
alter table public.inventario add column if not exists dano text;
alter table public.inventario add column if not exists tipo_dano text;
alter table public.inventario add column if not exists propriedades text;
alter table public.inventario add column if not exists dominio text;
alter table public.inventario add column if not exists alcance text;
alter table public.inventario add column if not exists bonus_ataque integer default 0;
alter table public.inventario add column if not exists bonus_dano integer default 0;
alter table public.inventario add column if not exists bonus_ca integer default 0;
alter table public.inventario add column if not exists ca_base integer;
alter table public.inventario add column if not exists observacoes text;

alter table public.anotacoes add column if not exists user_id uuid;
alter table public.anotacoes add column if not exists personagem_id uuid;
alter table public.anotacoes add column if not exists campanha_id uuid;
alter table public.anotacoes add column if not exists titulo text;
alter table public.anotacoes add column if not exists conteudo text;
alter table public.anotacoes add column if not exists payload jsonb default '{}'::jsonb;
alter table public.anotacoes add column if not exists created_at timestamptz default now();
alter table public.anotacoes add column if not exists updated_at timestamptz default now();

alter table public.rolagens add column if not exists user_id uuid;
alter table public.rolagens add column if not exists campanha_id uuid;
alter table public.rolagens add column if not exists personagem_id uuid;
alter table public.rolagens add column if not exists formula text;
alter table public.rolagens add column if not exists resultado text;
alter table public.rolagens add column if not exists payload jsonb default '{}'::jsonb;
alter table public.rolagens add column if not exists created_at timestamptz default now();

alter table public.grid_tokens add column if not exists campanha_id uuid;
alter table public.grid_tokens add column if not exists cena_id text;
alter table public.grid_tokens add column if not exists personagem_id uuid;
alter table public.grid_tokens add column if not exists nome text;
alter table public.grid_tokens add column if not exists imagem_url text;
alter table public.grid_tokens add column if not exists x integer default 0;
alter table public.grid_tokens add column if not exists y integer default 0;
alter table public.grid_tokens add column if not exists largura numeric default 1;
alter table public.grid_tokens add column if not exists altura numeric default 1;
alter table public.grid_tokens add column if not exists rotacao numeric default 0;
alter table public.grid_tokens add column if not exists visivel boolean default true;
alter table public.grid_tokens add column if not exists bloqueado boolean default false;
alter table public.grid_tokens add column if not exists updated_by uuid;
alter table public.grid_tokens add column if not exists payload jsonb default '{}'::jsonb;
alter table public.grid_tokens add column if not exists created_at timestamptz default now();
alter table public.grid_tokens add column if not exists updated_at timestamptz default now();

create index if not exists grid_tokens_campanha_cena_idx on public.grid_tokens (campanha_id, cena_id);
create index if not exists grid_tokens_personagem_idx on public.grid_tokens (personagem_id);

alter table public.grid_tokens replica identity full;
alter table public.personagens replica identity full;
alter table public.campanhas replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'grid_tokens'
  ) then
    alter publication supabase_realtime add table public.grid_tokens;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'personagens'
  ) then
    alter publication supabase_realtime add table public.personagens;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'campanhas'
  ) then
    alter publication supabase_realtime add table public.campanhas;
  end if;
end $$;
