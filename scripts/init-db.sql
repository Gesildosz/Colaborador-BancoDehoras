-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dock TEXT NOT NULL,
    plate TEXT NOT NULL,
    seal TEXT,
    temperature TEXT,
    status TEXT NOT NULL,
    scheduled_date DATE,
    vehicle_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Ocorrências
CREATE TABLE IF NOT EXISTS occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    items JSONB NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_type ON vehicles (vehicle_type);
CREATE INDEX IF NOT EXISTS idx_occurrences_vehicle_id ON occurrences (vehicle_id);
