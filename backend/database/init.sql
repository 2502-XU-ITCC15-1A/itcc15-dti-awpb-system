-- AWPB Database Schema - Matching Frontend Data Structures

-- 1. Users table (matches frontend account structure)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, --NEVER STORE RAW PASSWORDS!
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'encoder')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Entries table (matching frontend entry structure with monthly targets)
CREATE TABLE IF NOT EXISTS entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    planning_year INTEGER NOT NULL,
    unit TEXT NOT NULL,
    component TEXT NOT NULL,
    sub_component TEXT NOT NULL,
    key_activity TEXT NOT NULL,

    no TEXT, -- Activity number
    performance_indicator TEXT,
    sub_activity TEXT,
    title_of_activities TEXT NOT NULL,
    unit_cost DECIMAL(12,2),

    -- Monthly targets
    targets_jan DECIMAL(10,2) DEFAULT 0,
    targets_feb DECIMAL(10,2) DEFAULT 0,
    targets_mar DECIMAL(10,2) DEFAULT 0,
    targets_apr DECIMAL(10,2) DEFAULT 0,
    targets_may DECIMAL(10,2) DEFAULT 0,
    targets_jun DECIMAL(10,2) DEFAULT 0,
    targets_jul DECIMAL(10,2) DEFAULT 0,
    targets_aug DECIMAL(10,2) DEFAULT 0,
    targets_sep DECIMAL(10,2) DEFAULT 0,
    targets_oct DECIMAL(10,2) DEFAULT 0,
    targets_nov DECIMAL(10,2) DEFAULT 0,
    targets_dec DECIMAL(10,2) DEFAULT 0,
    -- Status and workflow
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'Pending Review', 'Returned', 'Approved', 'Rejected')),
    submission_date TIMESTAMPTZ,
    review_date TIMESTAMPTZ,
    reviewer_id UUID REFERENCES users(id),
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template hierarchy table (matching awpb_dropdown_tree.json structure)
CREATE TABLE IF NOT EXISTS template_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL,
    sub_component TEXT NOT NULL,
    key_activity TEXT NOT NULL,
    activity_no TEXT,
    performance_indicator TEXT,
    sub_activities JSONB DEFAULT '[]', -- Array of sub-activities
    unit_options JSONB DEFAULT '[]', -- Array of unit options this applies to
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unit options table
CREATE TABLE IF NOT EXISTS unit_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value TEXT UNIQUE NOT NULL,
    aliases JSONB DEFAULT '[]', -- Array of alias strings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submission windows table
CREATE TABLE IF NOT EXISTS submission_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), --Auto-generate unique ID
    title TEXT NOT NULL, 
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default users (password: password123)
INSERT INTO users (username, full_name, email, password_hash, role, status) VALUES
('enc_user', 'Default Encoder', 'encoder@dti.gov.ph', '$2b$10$rQZ8ZHWKZQZQZQZQZQZQZOZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ', 'encoder', 'active'),
('adm_admin', 'Default Admin', 'admin@dti.gov.ph', '$2b$10$rQZ8ZHWKZQZQZQZQZQZQZOZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ', 'admin', 'active')
ON CONFLICT (username) DO NOTHING;

-- Insert unit options (from frontend data)
INSERT INTO unit_options (value, aliases) VALUES
('RCU', '["RCU"]'),
('BKD', '["BKD", "Bukidnon"]'),
('LDN', '["LDN", "Lanao del Norte"]'),
('MISOR', '["MOR", "Misamis Oriental"]')
ON CONFLICT (value) DO NOTHING;

-- Insert default submission window
INSERT INTO submission_windows (title, start_date, end_date, is_active) VALUES
('FY 2026 Submission Window', '2026-04-01', '2026-04-30', true)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_entries_owner_id ON entries(owner_id);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_planning_year ON entries(planning_year);
CREATE INDEX IF NOT EXISTS idx_entries_unit ON entries(unit);
CREATE INDEX IF NOT EXISTS idx_entries_component ON entries(component);
CREATE INDEX IF NOT EXISTS idx_template_hierarchy_component ON template_hierarchy(component);
CREATE INDEX IF NOT EXISTS idx_template_hierarchy_sub_component ON template_hierarchy(sub_component);
