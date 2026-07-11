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

alter table public.campanhas add column if not exists owner_id uuid;
alter table public.campanhas add column if not exists mestre_id uuid;
alter table public.campanhas add column if not exists nome text;
alter table public.campanhas add column if not exists codigo_convite text;
alter table public.campanhas add column if not exists invite_code text;
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
alter table public.personagens add column if not exists created_at timestamptz default now();
alter table public.personagens add column if not exists updated_at timestamptz default now();

alter table public.inventario add column if not exists user_id uuid;
alter table public.inventario add column if not exists personagem_id uuid;
alter table public.inventario add column if not exists nome text;
alter table public.inventario add column if not exists payload jsonb default '{}'::jsonb;
alter table public.inventario add column if not exists created_at timestamptz default now();
alter table public.inventario add column if not exists updated_at timestamptz default now();

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
