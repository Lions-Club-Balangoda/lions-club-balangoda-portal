-- =============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Initial Core Schema for Lions Club of Balangoda Web Portal & CMS
-- Target Database: PostgreSQL 14+ (Compatible with Supabase / Neon / Render / AWS RDS)
-- Author: M.P Asmad Sahee (Zahi) - Group 14
-- Reviewers: M.N.M Nafris, M.H.M Yoosuf
-- Date: November 2026
-- =============================================================================

-- Enable pgcrypto / uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS & AUTHENTICATION
-- =============================================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'EDITOR');

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'EDITOR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =============================================================================
-- 2. PASSWORD RESET TOKENS (M01 Security & Recovery)
-- =============================================================================

CREATE TABLE password_reset_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pwd_reset_token_hash UNIQUE (token_hash)
);

CREATE INDEX idx_pwd_reset_user ON password_reset_tokens(user_id, expires_at);
CREATE INDEX idx_pwd_reset_lookup ON password_reset_tokens(token_hash, expires_at, used_at);

-- =============================================================================
-- 3. MEDIA ASSETS (Cloudinary / S3 CDN tracking)
-- =============================================================================

CREATE TABLE media_assets (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(255) NOT NULL,
    secure_url VARCHAR(1024) NOT NULL,
    file_name VARCHAR(255) NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NULL,
    width INTEGER NULL,
    height INTEGER NULL,
    alt_text VARCHAR(255) NULL,
    uploaded_by UUID NULL REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_media_assets_public_id UNIQUE (public_id)
);

CREATE INDEX idx_media_assets_created ON media_assets(created_at DESC);

-- =============================================================================
-- 4. BOARD TERMS (Lionistic Administrative Years - July 1 to June 30)
-- =============================================================================

CREATE TABLE board_terms (
    term_id VARCHAR(20) PRIMARY KEY, -- e.g., '2024-2025'
    term_label VARCHAR(100) NOT NULL, -- e.g., 'Lionistic Year 2024/2025'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    theme VARCHAR(255) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_term_dates CHECK (start_date < end_date)
);

CREATE INDEX idx_board_terms_current ON board_terms(is_current);
CREATE INDEX idx_board_terms_dates ON board_terms(start_date DESC);

-- =============================================================================
-- 5. EXECUTIVE MEMBERS (Club Officers per Lionistic Year)
-- =============================================================================

CREATE TYPE member_status AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE executive_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id VARCHAR(20) NOT NULL REFERENCES board_terms(term_id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    lion_title VARCHAR(50) NULL, -- e.g., 'Lion Prof.', 'Lion Dr.', 'Lion'
    bio TEXT NULL,
    profile_image_url VARCHAR(1024) NULL,
    profile_asset_id UUID NULL REFERENCES media_assets(asset_id) ON DELETE SET NULL,
    contact_email VARCHAR(255) NULL,
    contact_phone VARCHAR(50) NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    status member_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exec_members_term_order ON executive_members(term_id, display_order ASC);
CREATE INDEX idx_exec_members_status ON executive_members(status);

-- =============================================================================
-- 6. PROJECTS (Community Service Showcase & Archive)
-- =============================================================================

CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE service_pillar AS ENUM (
    'HEALTHCARE',
    'EDUCATION',
    'ENVIRONMENT',
    'POVERTY_RELIEF',
    'OTHER'
);

CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    category service_pillar NOT NULL,
    summary VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    cover_image_url VARCHAR(1024) NULL,
    cover_asset_id UUID NULL REFERENCES media_assets(asset_id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status content_status NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ NULL,
    author_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_projects_slug UNIQUE (slug)
);

CREATE INDEX idx_projects_status_pub ON projects(status, published_at DESC);
CREATE INDEX idx_projects_category_status ON projects(category, status);
CREATE INDEX idx_projects_event_date ON projects(event_date DESC);
CREATE INDEX idx_projects_year ON projects(EXTRACT(YEAR FROM event_date), status);
CREATE INDEX idx_projects_slug ON projects(slug);

-- =============================================================================
-- 7. PROJECT GALLERY (Responsive Lightbox Photo Galleries)
-- =============================================================================

CREATE TABLE project_gallery (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    asset_id UUID NULL REFERENCES media_assets(asset_id) ON DELETE SET NULL,
    image_url VARCHAR(1024) NOT NULL,
    caption VARCHAR(500) NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gallery_project_order ON project_gallery(project_id, display_order ASC);

-- =============================================================================
-- 8. NEWS & ANNOUNCEMENTS (UC09, FR-06, Class Diagram)
-- =============================================================================

CREATE TYPE news_type_enum AS ENUM ('NEWS', 'ANNOUNCEMENT', 'PRESS_RELEASE');

CREATE TABLE news_announcements (
    news_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    summary VARCHAR(500) NULL,
    content TEXT NOT NULL,
    cover_image_url VARCHAR(1024) NULL,
    cover_asset_id UUID NULL REFERENCES media_assets(asset_id) ON DELETE SET NULL,
    news_type news_type_enum NOT NULL DEFAULT 'NEWS',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    expire_date TIMESTAMPTZ NULL,
    status content_status NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ NULL,
    author_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_news_slug UNIQUE (slug)
);

CREATE INDEX idx_news_status_pub ON news_announcements(status, published_at DESC);
CREATE INDEX idx_news_pinned ON news_announcements(is_pinned, status, published_at DESC);
CREATE INDEX idx_news_expire ON news_announcements(expire_date);
CREATE INDEX idx_news_type_status ON news_announcements(news_type, status);
CREATE INDEX idx_news_slug ON news_announcements(slug);

-- =============================================================================
-- 9. VOLUNTEER APPLICATIONS (Dedicated Volunteer Intake - FR-05, UC05, UC12)
-- =============================================================================

CREATE TYPE volunteer_status AS ENUM (
    'PENDING',
    'REVIEWED',
    'INTERVIEWED',
    'ACCEPTED',
    'REJECTED'
);

CREATE TABLE volunteer_applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    nic_or_passport VARCHAR(50) NULL,
    date_of_birth DATE NULL,
    gender VARCHAR(20) NULL,
    address_city VARCHAR(100) NOT NULL,
    occupation VARCHAR(100) NULL,
    skills_interests TEXT NOT NULL,
    availability VARCHAR(100) NOT NULL,
    previous_experience TEXT NULL,
    motivation_statement TEXT NULL,
    status volunteer_status NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT NULL,
    reviewed_by UUID NULL REFERENCES users(user_id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_volunteers_status_date ON volunteer_applications(status, submitted_at DESC);
CREATE INDEX idx_volunteers_email ON volunteer_applications(email);
CREATE INDEX idx_volunteers_submitted ON volunteer_applications(submitted_at DESC);

-- =============================================================================
-- 10. GENERAL INQUIRIES & SPONSORSHIPS (FR-05, UC06, UC12)
-- =============================================================================

CREATE TYPE inquiry_type_enum AS ENUM (
    'GENERAL',
    'SPONSORSHIP',
    'PARTNERSHIP',
    'DONATION',
    'FEEDBACK'
);

CREATE TYPE inquiry_status AS ENUM (
    'NEW',
    'IN_PROGRESS',
    'RESOLVED',
    'SPAM'
);

CREATE TABLE general_inquiries (
    inquiry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name VARCHAR(150) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50) NULL,
    organization_name VARCHAR(150) NULL,
    inquiry_type inquiry_type_enum NOT NULL DEFAULT 'GENERAL',
    subject VARCHAR(255) NOT NULL,
    message_content TEXT NOT NULL,
    status inquiry_status NOT NULL DEFAULT 'NEW',
    internal_notes TEXT NULL,
    assigned_to UUID NULL REFERENCES users(user_id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inquiries_status_date ON general_inquiries(status, submitted_at DESC);
CREATE INDEX idx_inquiries_type_status ON general_inquiries(inquiry_type, status);
CREATE INDEX idx_inquiries_email ON general_inquiries(sender_email);

-- =============================================================================
-- 11. IMPACT STATISTICS (Homepage Dynamic Counters - Section 1.13, 2.8, 3.2)
-- =============================================================================

CREATE TABLE impact_statistics (
    stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_key VARCHAR(50) NOT NULL, -- e.g., 'BENEFICIARIES_SERVED', 'VISION_SCREENINGS'
    label VARCHAR(100) NOT NULL,     -- e.g., 'Beneficiaries Served'
    metric_value INTEGER NOT NULL DEFAULT 0,
    prefix VARCHAR(10) NULL,         -- e.g., '>'
    suffix VARCHAR(10) NULL,         -- e.g., '+' or 'k'
    icon_name VARCHAR(50) NULL,      -- e.g., 'Users', 'Eye', 'TreePine', 'HeartHandshake'
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by UUID NULL REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_impact_key UNIQUE (metric_key)
);

CREATE INDEX idx_impact_stats_order ON impact_statistics(is_active, display_order ASC);

-- =============================================================================
-- 12. AUTOMATIC TIMESTAMP UPDATE TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_executive_members_updated_at
BEFORE UPDATE ON executive_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_news_announcements_updated_at
BEFORE UPDATE ON news_announcements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_volunteer_applications_updated_at
BEFORE UPDATE ON volunteer_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_general_inquiries_updated_at
BEFORE UPDATE ON general_inquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_impact_statistics_updated_at
BEFORE UPDATE ON impact_statistics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

