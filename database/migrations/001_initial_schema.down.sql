-- =============================================================================
-- Migration Rollback: 001_initial_schema.down.sql
-- Description: Rollback Core Schema for Lions Club of Balangoda Web Portal & CMS
-- =============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS trg_impact_statistics_updated_at ON impact_statistics;
DROP TRIGGER IF EXISTS trg_general_inquiries_updated_at ON general_inquiries;
DROP TRIGGER IF EXISTS trg_volunteer_applications_updated_at ON volunteer_applications;
DROP TRIGGER IF EXISTS trg_news_announcements_updated_at ON news_announcements;
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS trg_executive_members_updated_at ON executive_members;
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS impact_statistics CASCADE;
DROP TABLE IF EXISTS general_inquiries CASCADE;
DROP TABLE IF EXISTS volunteer_applications CASCADE;
DROP TABLE IF EXISTS news_announcements CASCADE;
DROP TABLE IF EXISTS project_gallery CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS executive_members CASCADE;
DROP TABLE IF EXISTS board_terms CASCADE;
DROP TABLE IF EXISTS media_assets CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS inquiry_status CASCADE;
DROP TYPE IF EXISTS inquiry_type_enum CASCADE;
DROP TYPE IF EXISTS volunteer_status CASCADE;
DROP TYPE IF EXISTS news_type_enum CASCADE;
DROP TYPE IF EXISTS service_pillar CASCADE;
DROP TYPE IF EXISTS content_status CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

