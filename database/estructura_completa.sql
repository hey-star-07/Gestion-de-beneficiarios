

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    beneficiary_id INTEGER UNIQUE,
    verification_code VARCHAR(10),
    verification_code_expires TIMESTAMP,
    reset_code VARCHAR(10),
    reset_code_expires TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    refresh_token TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE beneficiaries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    address VARCHAR(255),
    map_link VARCHAR(500),
    phone VARCHAR(20),
    family_members_count INTEGER DEFAULT 0,
    croquis_file VARCHAR(255),
    church_attendance BOOLEAN DEFAULT false,
    is_baptized BOOLEAN DEFAULT false,
    church_name VARCHAR(150),
    pastor_name VARCHAR(150),
    pastor_phone VARCHAR(20),
    is_working BOOLEAN DEFAULT false,
    workplace VARCHAR(150),
    work_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE education_profiles (
    id SERIAL PRIMARY KEY,
    beneficiary_id INTEGER NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
    career_name VARCHAR(150) NOT NULL,
    institution VARCHAR(200),
    year_of_study INTEGER,
    semester INTEGER,
    year_semester VARCHAR(50),
    institution_address VARCHAR(255),
    institution_map_link VARCHAR(500),
    schedule_file VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE family_members (
    id SERIAL PRIMARY KEY,
    beneficiary_id INTEGER NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_beneficiary_id ON users(beneficiary_id);
CREATE INDEX idx_beneficiaries_code ON beneficiaries(code);
CREATE INDEX idx_beneficiaries_email ON beneficiaries(email);
CREATE INDEX idx_education_beneficiary_id ON education_profiles(beneficiary_id);
CREATE INDEX idx_family_beneficiary_id ON family_members(beneficiary_id);
CREATE INDEX idx_settings_key ON system_settings(setting_key);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_profiles_updated_at BEFORE UPDATE ON education_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE users 
    ADD CONSTRAINT fk_users_beneficiary 
    FOREIGN KEY (beneficiary_id) 
    REFERENCES beneficiaries(id) 
    ON DELETE SET NULL;

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES (
    'data_submission_deadline',
    NULL,
    'Fecha límite para que los beneficiarios puedan modificar sus datos'
) ON CONFLICT (setting_key) DO NOTHING;