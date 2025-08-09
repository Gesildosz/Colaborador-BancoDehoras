-- Criar extensões necessárias
create extension if not exists "pgcrypto";

-- Tabela de Colaboradores
create table if not exists public.collaborators (
  cracha text primary key,
  id_access text unique not null,
  nome text not null,
  cargo text,
  turno text,
  supervisor text,
  saldo numeric not null default 0,
  created_at timestamp with time zone default now()
);

-- Tabela de Movimentações (Histórico)
create table if not exists public.movements (
  id uuid primary key default gen_random_uuid(),
  cracha text not null references public.collaborators(cracha) on delete cascade,
  delta numeric not null,
  saldo_after numeric not null,
  motivo text,
  created_at timestamp with time zone default now()
);

-- Tabela de Administradores
create table if not exists public.admins (
  usuario text primary key,
  senha text not null, -- Em produção, armazene hash!
  nome text not null,
  cracha text not null,
  perm_criar_colaborador boolean not null default false,
  perm_criar_admin boolean not null default false,
  perm_lancar_horas boolean not null default true,
  perm_alterar_codigo boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Desativar RLS para protótipo (em produção, habilite RLS e crie policies)
alter table public.collaborators disable row level security;
alter table public.movements disable row level security;
alter table public.admins disable row level security;

-- Seeds
-- Admin mestre (GDSSOUZ5 / 902512)
insert into public.admins (usuario, senha, nome, cracha, perm_criar_colaborador, perm_criar_admin, perm_lancar_horas, perm_alterar_codigo)
values ('GDSSOUZ5','902512','Administrador Mestre','000000', true,true,true,true)
on conflict (usuario) do nothing;

-- Colaborador de exemplo com saldo +8 e histórico
insert into public.collaborators (cracha, id_access, nome, cargo, turno, supervisor, saldo)
values ('220001228','123456','Gesildo Silva','Controlador','Noturno','—', 8)
on conflict (cracha) do nothing;

-- Histórico exemplo
do $$
begin
  if exists (select 1 from public.collaborators where cracha = '220001228') then
    -- limpar movimentos antigos do seed
    delete from public.movements where cracha = '220001228';
    insert into public.movements (cracha, delta, saldo_after, motivo, created_at)
    values 
      ('220001228', 2, 2, 'Banco de horas', now() - interval '7 days'),
      ('220001228', 3, 5, 'Banco de horas', now() - interval '4 days'),
      ('220001228', 3, 8, 'Banco de horas', now() - interval '1 day');
  end if;
end $$;
