-- =============================================================================
-- Lions Club of Balangoda Web Portal & Content Management System
-- MySQL 8.0 Compatible Schema
-- File: database/schema.mysql.sql
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `user_id` CHAR(36) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `role` ENUM('ADMIN', 'EDITOR') NOT NULL DEFAULT 'EDITOR',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `last_login_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_users_username` (`username`),
    UNIQUE KEY `uq_users_email` (`email`),
    KEY `idx_users_role` (`role`),
    KEY `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PASSWORD RESET TOKENS
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
    `token_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `used_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`token_id`),
    UNIQUE KEY `uq_pwd_reset_token_hash` (`token_hash`),
    KEY `idx_pwd_reset_user` (`user_id`, `expires_at`),
    KEY `idx_pwd_reset_lookup` (`token_hash`, `expires_at`, `used_at`),
    CONSTRAINT `fk_pwd_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MEDIA ASSETS
DROP TABLE IF EXISTS `media_assets`;
CREATE TABLE `media_assets` (
    `asset_id` CHAR(36) NOT NULL,
    `public_id` VARCHAR(255) NOT NULL,
    `secure_url` VARCHAR(1024) NOT NULL,
    `file_name` VARCHAR(255) NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `file_size_bytes` BIGINT NULL,
    `width` INT NULL,
    `height` INT NULL,
    `alt_text` VARCHAR(255) NULL,
    `uploaded_by` CHAR(36) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`asset_id`),
    UNIQUE KEY `uq_media_assets_public_id` (`public_id`),
    KEY `idx_media_assets_created` (`created_at`),
    CONSTRAINT `fk_media_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BOARD TERMS
DROP TABLE IF EXISTS `board_terms`;
CREATE TABLE `board_terms` (
    `term_id` VARCHAR(20) NOT NULL,
    `term_label` VARCHAR(100) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT FALSE,
    `theme` VARCHAR(255) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`term_id`),
    KEY `idx_board_terms_current` (`is_current`),
    KEY `idx_board_terms_dates` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. EXECUTIVE MEMBERS
DROP TABLE IF EXISTS `executive_members`;
CREATE TABLE `executive_members` (
    `member_id` CHAR(36) NOT NULL,
    `term_id` VARCHAR(20) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `designation` VARCHAR(100) NOT NULL,
    `lion_title` VARCHAR(50) NULL,
    `bio` TEXT NULL,
    `profile_image_url` VARCHAR(1024) NULL,
    `profile_asset_id` CHAR(36) NULL,
    `contact_email` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(50) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`member_id`),
    KEY `idx_exec_members_term_order` (`term_id`, `display_order`),
    KEY `idx_exec_members_status` (`status`),
    CONSTRAINT `fk_exec_members_term` FOREIGN KEY (`term_id`) REFERENCES `board_terms` (`term_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_exec_members_asset` FOREIGN KEY (`profile_asset_id`) REFERENCES `media_assets` (`asset_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PROJECTS
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
    `project_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `category` ENUM('HEALTHCARE', 'EDUCATION', 'ENVIRONMENT', 'POVERTY_RELIEF', 'OTHER') NOT NULL,
    `summary` VARCHAR(500) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `cover_image_url` VARCHAR(1024) NULL,
    `cover_asset_id` CHAR(36) NULL,
    `event_date` DATE NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `published_at` DATETIME NULL,
    `author_id` CHAR(36) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`project_id`),
    UNIQUE KEY `uq_projects_slug` (`slug`),
    KEY `idx_projects_status_pub` (`status`, `published_at`),
    KEY `idx_projects_category_status` (`category`, `status`),
    KEY `idx_projects_event_date` (`event_date`),
    KEY `idx_projects_author` (`author_id`),
    FULLTEXT KEY `ft_projects_search` (`title`, `summary`),
    CONSTRAINT `fk_projects_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_projects_asset` FOREIGN KEY (`cover_asset_id`) REFERENCES `media_assets` (`asset_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PROJECT GALLERY
DROP TABLE IF EXISTS `project_gallery`;
CREATE TABLE `project_gallery` (
    `image_id` CHAR(36) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `asset_id` CHAR(36) NULL,
    `image_url` VARCHAR(1024) NOT NULL,
    `caption` VARCHAR(500) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `is_cover` BOOLEAN NOT NULL DEFAULT FALSE,
    `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`image_id`),
    KEY `idx_gallery_project_order` (`project_id`, `display_order`),
    CONSTRAINT `fk_gallery_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_gallery_asset` FOREIGN KEY (`asset_id`) REFERENCES `media_assets` (`asset_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. NEWS & ANNOUNCEMENTS
DROP TABLE IF EXISTS `news_announcements`;
CREATE TABLE `news_announcements` (
    `news_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `summary` VARCHAR(500) NULL,
    `content` LONGTEXT NOT NULL,
    `cover_image_url` VARCHAR(1024) NULL,
    `cover_asset_id` CHAR(36) NULL,
    `news_type` ENUM('NEWS', 'ANNOUNCEMENT', 'PRESS_RELEASE') NOT NULL DEFAULT 'NEWS',
    `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE,
    `expire_date` DATETIME NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `published_at` DATETIME NULL,
    `author_id` CHAR(36) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`news_id`),
    UNIQUE KEY `uq_news_slug` (`slug`),
    KEY `idx_news_status_pub` (`status`, `published_at`),
    KEY `idx_news_pinned` (`is_pinned`, `status`, `published_at`),
    KEY `idx_news_expire` (`expire_date`),
    KEY `idx_news_type_status` (`news_type`, `status`),
    FULLTEXT KEY `ft_news_search` (`title`),
    CONSTRAINT `fk_news_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_news_asset` FOREIGN KEY (`cover_asset_id`) REFERENCES `media_assets` (`asset_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. VOLUNTEER APPLICATIONS
DROP TABLE IF EXISTS `volunteer_applications`;
CREATE TABLE `volunteer_applications` (
    `application_id` CHAR(36) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(50) NOT NULL,
    `nic_or_passport` VARCHAR(50) NULL,
    `date_of_birth` DATE NULL,
    `gender` VARCHAR(20) NULL,
    `address_city` VARCHAR(100) NOT NULL,
    `occupation` VARCHAR(100) NULL,
    `skills_interests` TEXT NOT NULL,
    `availability` VARCHAR(100) NOT NULL,
    `previous_experience` TEXT NULL,
    `motivation_statement` TEXT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `admin_notes` TEXT NULL,
    `reviewed_by` CHAR(36) NULL,
    `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`application_id`),
    KEY `idx_volunteers_status_date` (`status`, `submitted_at`),
    KEY `idx_volunteers_email` (`email`),
    KEY `idx_volunteers_submitted` (`submitted_at`),
    CONSTRAINT `fk_volunteers_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. GENERAL INQUIRIES & SPONSORSHIPS
DROP TABLE IF EXISTS `general_inquiries`;
CREATE TABLE `general_inquiries` (
    `inquiry_id` CHAR(36) NOT NULL,
    `sender_name` VARCHAR(150) NOT NULL,
    `sender_email` VARCHAR(255) NOT NULL,
    `contact_number` VARCHAR(50) NULL,
    `organization_name` VARCHAR(150) NULL,
    `inquiry_type` ENUM('GENERAL', 'SPONSORSHIP', 'PARTNERSHIP', 'DONATION', 'FEEDBACK') NOT NULL DEFAULT 'GENERAL',
    `subject` VARCHAR(255) NOT NULL,
    `message_content` TEXT NOT NULL,
    `status` ENUM('NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM') NOT NULL DEFAULT 'NEW',
    `internal_notes` TEXT NULL,
    `assigned_to` CHAR(36) NULL,
    `resolved_at` DATETIME NULL,
    `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`inquiry_id`),
    KEY `idx_inquiries_status_date` (`status`, `submitted_at`),
    KEY `idx_inquiries_type_status` (`inquiry_type`, `status`),
    KEY `idx_inquiries_email` (`sender_email`),
    CONSTRAINT `fk_inquiries_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. IMPACT STATISTICS
DROP TABLE IF EXISTS `impact_statistics`;
CREATE TABLE `impact_statistics` (
    `stat_id` CHAR(36) NOT NULL,
    `metric_key` VARCHAR(50) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `metric_value` INT NOT NULL DEFAULT 0,
    `prefix` VARCHAR(10) NULL,
    `suffix` VARCHAR(10) NULL,
    `icon_name` VARCHAR(50) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `updated_by` CHAR(36) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`stat_id`),
    UNIQUE KEY `uq_impact_key` (`metric_key`),
    KEY `idx_impact_stats_order` (`is_active`, `display_order`),
    CONSTRAINT `fk_impact_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
