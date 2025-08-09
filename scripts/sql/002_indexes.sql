-- Índices úteis
create index if not exists idx_collaborators_id_access on public.collaborators (id_access);
create index if not exists idx_movements_cracha_created_at on public.movements (cracha, created_at desc);
