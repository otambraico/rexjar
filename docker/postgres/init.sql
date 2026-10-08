-- =============================================================================
-- REXJAR - SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- Arquitectura de Segregación de Dominios por Esquema (OLTP vs OLAP)
-- =============================================================================

-- Habilitar extensiones geoespaciales
CREATE EXTENSION IF NOT EXISTS postgis;

-- -----------------------------------------------------------------------------
-- 1. ESQUEMA TRANSACCIONAL MULTI-TENANT (corp_expense - OLTP)
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS corp_expense;

-- Tabla de Empresas / Tenants
CREATE TABLE IF NOT EXISTS corp_expense.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) UNIQUE NOT NULL, -- RUC / RFC / NIT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios / Colaboradores
CREATE TABLE IF NOT EXISTS corp_expense.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES corp_expense.companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'EMPLOYEE', -- EMPLOYEE, AUDITOR, ADMIN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Comprobantes de Rendición (Headers)
CREATE TABLE IF NOT EXISTS corp_expense.expense_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES corp_expense.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES corp_expense.users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'PEN',
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de Ítems / Recibos Individuales
CREATE TABLE IF NOT EXISTS corp_expense.expense_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES corp_expense.companies(id) ON DELETE CASCADE,
    claim_id UUID NOT NULL REFERENCES corp_expense.expense_claims(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- TAXI, TOLL, PARKING, MEAL, LODGING
    amount NUMERIC(12, 2) NOT NULL,
    ocr_confidence NUMERIC(3, 2), -- 0.00 a 1.00 (RF-06 Traffic light)
    traffic_light_status VARCHAR(20) DEFAULT 'GREEN', -- GREEN, YELLOW, RED
    image_url TEXT,
    origin_address TEXT,
    destination_address TEXT,
    anomaly_score NUMERIC(5, 2), -- Score de desvío % frente a benchmark
    anomaly_classification VARCHAR(20) DEFAULT 'NORMAL', -- NORMAL, RISK, FRAUD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar Row Level Security (RLS) para aislamiento multi-tenant
ALTER TABLE corp_expense.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_expense.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_expense.expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_expense.expense_items ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- 2. ESQUEMA ANALÍTICO GEOESPACIAL (mobility_intelligence - OLAP - ZERO PII)
-- NOTA CRÍTICA DE ARQUITECTURA:
-- No existen Claves Foráneas (FK) hacia corp_expense para garantizar k-anonimato.
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS mobility_intelligence;

-- Tabla de Observaciones de Movilidad Desvinculadas (Zero-PII)
CREATE TABLE IF NOT EXISTS mobility_intelligence.mobility_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_h3_index VARCHAR(15) NOT NULL, -- H3 Resolucin 8
    dest_h3_index VARCHAR(15) NOT NULL,   -- H3 Resolucin 8
    estimated_distance_km NUMERIC(8, 2) NOT NULL,
    estimated_duration_min NUMERIC(8, 2) NOT NULL,
    declared_fare NUMERIC(10, 2) NOT NULL,
    theoretical_base_fare NUMERIC(10, 2) NOT NULL,
    fare_discrepancy_factor NUMERIC(5, 2),
    time_window_block TIMESTAMP WITH TIME ZONE NOT NULL, -- Discretizado en bloques de 15 min
    vehicle_type VARCHAR(30) DEFAULT 'STANDARD_TAXI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices espaciales y hexagonales para agregaciones analíticas ultrarrápidas
CREATE INDEX IF NOT EXISTS idx_h3_origin ON mobility_intelligence.mobility_events (origin_h3_index);
CREATE INDEX IF NOT EXISTS idx_h3_dest ON mobility_intelligence.mobility_events (dest_h3_index);
CREATE INDEX IF NOT EXISTS idx_h3_pair ON mobility_intelligence.mobility_events (origin_h3_index, dest_h3_index);
CREATE INDEX IF NOT EXISTS idx_time_block ON mobility_intelligence.mobility_events (time_window_block);
