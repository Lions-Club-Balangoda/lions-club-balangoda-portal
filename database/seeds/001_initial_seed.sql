-- =============================================================================
-- Seed Data: 001_initial_seed.sql
-- Description: Baseline Seed Records for Lions Club of Balangoda Web Portal
-- =============================================================================

-- 1. Initial Admin User (password: Admin@Lions2026! - bcrypt hashed with work factor 12)
INSERT INTO users (user_id, username, email, password_hash, full_name, role, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin_balangoda',
    'admin@lionsclubbalangoda.org',
    '$2a$12$eA.6wPZ3o5fB2yJ3J7P0m.mK6J9wZ2vK9aK3xXyZ8P2mK6J9wZ2vK', -- hashed placeholder
    'Lion Administrator',
    'ADMIN',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- 2. Lionistic Board Terms
INSERT INTO board_terms (term_id, term_label, start_date, end_date, is_current, theme)
VALUES 
(
    '2023-2024',
    'Lionistic Year 2023/2024',
    '2023-07-01',
    '2024-06-30',
    FALSE,
    'Changing the World through Service'
),
(
    '2024-2025',
    'Lionistic Year 2024/2025',
    '2024-07-01',
    '2025-06-30',
    FALSE,
    'Make Your Mark'
),
(
    '2025-2026',
    'Lionistic Year 2025/2026',
    '2025-07-01',
    '2026-06-30',
    TRUE,
    'Lead With Care, Serve With Pride'
) ON CONFLICT (term_id) DO NOTHING;

-- 3. Executive Members (Current Board Sample per client letter & proposal)
INSERT INTO executive_members (term_id, full_name, designation, lion_title, bio, contact_email, display_order, status)
VALUES 
(
    '2025-2026',
    'T. Sanjeewa Prasad Jayaweera',
    'Club President',
    'Lion Prof.',
    'Dean & Professor, leading community service and educational upliftment across the Balangoda region.',
    'president@lionsclubbalangoda.org',
    1,
    'ACTIVE'
),
(
    '2025-2026',
    'Sunil Rathnayake',
    'Club Secretary',
    'Lion',
    'Overseeing club administration, project coordination, and international correspondence.',
    'secretary@lionsclubbalangoda.org',
    2,
    'ACTIVE'
),
(
    '2025-2026',
    'Chinthaka Fernando',
    'Club Treasurer',
    'Lion',
    'Managing club financial governance, project funds, and donor transparency.',
    'treasurer@lionsclubbalangoda.org',
    3,
    'ACTIVE'
);

-- 4. Initial Impact Statistics (FR-01, Section 1.13, Section 3.2)
INSERT INTO impact_statistics (metric_key, label, metric_value, prefix, suffix, icon_name, display_order, is_active)
VALUES 
(
    'BENEFICIARIES_SERVED',
    'Lives Impacted',
    15000,
    '>',
    '+',
    'Users',
    1,
    TRUE
),
(
    'VISION_SCREENINGS',
    'Free Vision Screenings',
    3500,
    NULL,
    '+',
    'Eye',
    2,
    TRUE
),
(
    'TREES_PLANTED',
    'Trees Planted in Sabaragamuwa',
    2000,
    NULL,
    '+',
    'TreePine',
    3,
    TRUE
),
(
    'PROJECTS_COMPLETED',
    'Community Projects Completed',
    120,
    NULL,
    '+',
    'HeartHandshake',
    4,
    TRUE
) ON CONFLICT (metric_key) DO NOTHING;

-- 5. Sample Initial Published Project
INSERT INTO projects (
    project_id,
    title,
    slug,
    category,
    summary,
    description,
    event_date,
    location,
    status,
    published_at,
    author_id
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Annual Free Vision & Eye Screening Camp 2026',
    'annual-free-vision-eye-screening-camp-2026',
    'HEALTHCARE',
    'Comprehensive eye examinations, distribution of 300+ free custom eyeglasses, and referrals for cataract surgeries.',
    '<p>The Lions Club of Balangoda successfully conducted its flagship Free Vision Screening and Eye Care Camp at the Balangoda Town Hall. Over 450 rural residents attended the clinic.</p>',
    '2026-03-15',
    'Town Hall, Balangoda',
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (slug) DO NOTHING;

-- 6. Sample Initial Pinned Announcement
INSERT INTO news_announcements (
    news_id,
    title,
    slug,
    summary,
    content,
    news_type,
    is_pinned,
    status,
    published_at,
    author_id
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Official Launch of the Lions Club of Balangoda Community Web Portal',
    'official-launch-balangoda-web-portal',
    'Announcing our new digital platform connecting community members, donors, and humanitarian volunteers.',
    '<p>We are delighted to present the official web portal of the Lions Club of Balangoda, developed in partnership with the Sabaragamuwa University of Sri Lanka.</p>',
    'ANNOUNCEMENT',
    TRUE,
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (slug) DO NOTHING;

