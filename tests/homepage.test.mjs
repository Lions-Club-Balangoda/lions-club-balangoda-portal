import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  CLUB_MISSION_VISION,
  SERVICE_PILLARS,
  CLUB_HISTORY,
  IMPACT_METRICS,
} from '../src/data/club-pillars.ts';
import { CLUB_CONTACT_INFO } from '../src/data/navigation.ts';

const rootDir = process.cwd();

describe('Public Homepage Story Test Suite (LBW-31, FR-01)', () => {
  describe('AC1 & AC2: Verified Club-Supplied Mission, Vision, and Motto', () => {
    it('TC-HOME-001: Mission statement contains verified club-supplied text', () => {
      assert.ok(
        typeof CLUB_MISSION_VISION.mission === 'string' && CLUB_MISSION_VISION.mission.length > 50,
        'Mission statement must be a non-empty string exceeding 50 chars'
      );
      assert.ok(
        CLUB_MISSION_VISION.mission.includes('Balangoda'),
        'Mission statement must explicitly mention Balangoda'
      );
    });

    it('TC-HOME-002: Vision statement contains verified humanitarian vision', () => {
      assert.ok(
        typeof CLUB_MISSION_VISION.vision === 'string' && CLUB_MISSION_VISION.vision.length > 50,
        'Vision statement must be a non-empty string exceeding 50 chars'
      );
      assert.ok(
        CLUB_MISSION_VISION.vision.includes('Sabaragamuwa') ||
          CLUB_MISSION_VISION.vision.includes('Balangoda'),
        'Vision statement must reference the regional community scope'
      );
    });

    it('TC-HOME-003: Club motto is strictly "We Serve" aligned with Lions International', () => {
      assert.strictEqual(CLUB_MISSION_VISION.motto, 'We Serve');
      assert.strictEqual(CLUB_CONTACT_INFO.motto, 'We Serve');
    });
  });

  describe('AC1 & AC2: Four Core Humanitarian Service Pillars', () => {
    it('TC-HOME-004: All 4 service pillars are defined and present in agreed content source', () => {
      assert.strictEqual(SERVICE_PILLARS.length, 4, 'Must define exactly 4 service pillars');

      const expectedCategories = ['HEALTHCARE', 'EDUCATION', 'ENVIRONMENT', 'RELIEF'];
      const actualCategories = SERVICE_PILLARS.map((p) => p.category);

      expectedCategories.forEach((cat) => {
        assert.ok(actualCategories.includes(cat), `Service pillars must include category: ${cat}`);
      });
    });

    it('TC-HOME-005: Every pillar has required content fields and multiple key initiatives', () => {
      SERVICE_PILLARS.forEach((pillar) => {
        assert.ok(pillar.id && pillar.id.startsWith('pillar-'), 'Pillar must have valid id');
        assert.ok(pillar.title && pillar.title.length > 0, 'Pillar must have title');
        assert.ok(
          pillar.shortDescription && pillar.shortDescription.length > 20,
          'Pillar must have short description'
        );
        assert.ok(
          pillar.fullDescription && pillar.fullDescription.length > 50,
          'Pillar must have comprehensive description'
        );
        assert.ok(
          Array.isArray(pillar.keyInitiatives) && pillar.keyInitiatives.length >= 3,
          `${pillar.title} must have at least 3 key initiatives`
        );
        assert.ok(
          pillar.impactHighlight && pillar.impactHighlight.length > 10,
          'Pillar must have measurable impact highlight'
        );
      });
    });
  });

  describe('AC1 & AC2: Balangoda Charter Heritage & Regional Roots', () => {
    it('TC-HOME-006: Club history summary defines District 306 charter and local region', () => {
      assert.ok(
        CLUB_HISTORY.charterDistrict.includes('District 306'),
        'Charter must specify District 306'
      );
      assert.ok(
        CLUB_HISTORY.regionServed.includes('Balangoda'),
        'Region served must include Balangoda'
      );
      assert.ok(
        CLUB_HISTORY.establishedSummary.length > 100,
        'History summary must be substantive'
      );
      assert.ok(
        CLUB_HISTORY.keyCommitments.length >= 3,
        'Must outline at least 3 core operational commitments'
      );
    });
  });

  describe('AC1 & AC2: Community Impact Milestones', () => {
    it('TC-HOME-007: Impact statistics match verified database seeds and milestones', () => {
      assert.strictEqual(IMPACT_METRICS.length, 4, 'Must present 4 core impact metrics');

      const livesMetric = IMPACT_METRICS.find((m) => m.key === 'BENEFICIARIES_SERVED');
      assert.ok(livesMetric, 'Must include BENEFICIARIES_SERVED');
      assert.strictEqual(livesMetric.value, 15000);

      const visionMetric = IMPACT_METRICS.find((m) => m.key === 'VISION_SCREENINGS');
      assert.ok(visionMetric, 'Must include VISION_SCREENINGS');
      assert.strictEqual(visionMetric.value, 3500);

      const treesMetric = IMPACT_METRICS.find((m) => m.key === 'TREES_PLANTED');
      assert.ok(treesMetric, 'Must include TREES_PLANTED');
      assert.strictEqual(treesMetric.value, 2000);

      const projectsMetric = IMPACT_METRICS.find((m) => m.key === 'PROJECTS_COMPLETED');
      assert.ok(projectsMetric, 'Must include PROJECTS_COMPLETED');
      assert.strictEqual(projectsMetric.value, 120);
    });
  });

  describe('AC3 & AC4: Responsive Structure, Semantic Headings & Accessibility', () => {
    it('TC-HOME-008: Homepage page.tsx renders all 5 required structural sections', () => {
      const pagePath = path.join(rootDir, 'src', 'app', 'page.tsx');
      assert.ok(fs.existsSync(pagePath), 'src/app/page.tsx must exist');
      const pageContent = fs.readFileSync(pagePath, 'utf8');

      assert.ok(pageContent.includes('<HeroSection'), 'Must include HeroSection');
      assert.ok(pageContent.includes('<ImpactMetricsSection'), 'Must include ImpactMetricsSection');
      assert.ok(
        pageContent.includes('<ServicePillarsSection'),
        'Must include ServicePillarsSection'
      );
      assert.ok(pageContent.includes('<MissionVisionSection'), 'Must include MissionVisionSection');
      assert.ok(pageContent.includes('<HistorySection'), 'Must include HistorySection');
    });

    it('TC-HOME-009: Section components enforce semantic heading hierarchy (h1 -> h2 -> h3)', () => {
      const heroPath = path.join(rootDir, 'src', 'components', 'home', 'HeroSection.tsx');
      const heroContent = fs.readFileSync(heroPath, 'utf8');
      assert.ok(heroContent.includes('<h1'), 'HeroSection must declare primary <h1> heading');

      const sections = [
        { file: 'MissionVisionSection.tsx', h2: 'mission-vision-heading' },
        { file: 'ServicePillarsSection.tsx', h2: 'service-pillars-heading' },
        { file: 'HistorySection.tsx', h2: 'history-heading' },
        { file: 'ImpactMetricsSection.tsx', h2: 'impact-heading' },
      ];

      sections.forEach(({ file, h2 }) => {
        const filePath = path.join(rootDir, 'src', 'components', 'home', file);
        assert.ok(fs.existsSync(filePath), `${file} must exist`);
        const content = fs.readFileSync(filePath, 'utf8');
        assert.ok(content.includes('<h2'), `${file} must declare section <h2> heading`);
        assert.ok(content.includes(h2), `${file} heading must include id="${h2}"`);
        assert.ok(
          content.includes(`aria-labelledby="${h2}"`),
          `${file} <section> must reference its heading via aria-labelledby`
        );
      });
    });

    it('TC-HOME-010: Components enforce responsive styling down to 360px without horizontal scroll', () => {
      const heroPath = path.join(rootDir, 'src', 'components', 'home', 'HeroSection.tsx');
      const heroContent = fs.readFileSync(heroPath, 'utf8');
      assert.ok(
        heroContent.includes('max-w-7xl') && heroContent.includes('px-4 sm:px-6 lg:px-8'),
        'Hero must enforce max width and responsive padding'
      );
      assert.ok(
        heroContent.includes('flex-col sm:flex-row'),
        'Hero CTAs must stack vertically on mobile (360px) and align horizontally on desktop'
      );

      const pillarsPath = path.join(
        rootDir,
        'src',
        'components',
        'home',
        'ServicePillarsSection.tsx'
      );
      const pillarsContent = fs.readFileSync(pillarsPath, 'utf8');
      assert.ok(
        pillarsContent.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-4'),
        'Service pillars must adapt from single column on mobile to 4 columns on large screens'
      );
    });

    it('TC-HOME-011: Public CTAs route to verified internal pages', () => {
      const heroPath = path.join(rootDir, 'src', 'components', 'home', 'HeroSection.tsx');
      const heroContent = fs.readFileSync(heroPath, 'utf8');
      assert.ok(heroContent.includes('href="/projects"'), 'Hero must link to /projects');
      assert.ok(heroContent.includes('href="/volunteer"'), 'Hero must link to /volunteer');

      const historyPath = path.join(rootDir, 'src', 'components', 'home', 'HistorySection.tsx');
      const historyContent = fs.readFileSync(historyPath, 'utf8');
      assert.ok(historyContent.includes('href="/about"'), 'History section must link to /about');
      assert.ok(historyContent.includes('href="/board"'), 'History section must link to /board');
    });
  });
});
