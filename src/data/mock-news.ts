import type { NewsItem } from '../types/news.ts';

export const SEED_NEWS: NewsItem[] = [
  {
    id: 'news-001',
    title: 'Official Launch of the Lions Club of Balangoda Community Web Portal',
    slug: 'official-launch-balangoda-web-portal',
    summary:
      'Announcing our new digital platform connecting community members, donors, and humanitarian volunteers across District 306.',
    content: `
      <p>The Lions Club of Balangoda (Lions Clubs International District 306) is proud to announce the official launch of our unified digital community portal.</p>
      <p>Developed in collaboration with the Faculty of Computing at Sabaragamuwa University of Sri Lanka, this platform offers transparent public access to verified service project reports, executive board records, and direct volunteer intake workflows.</p>
      <p>We invite all community members, partners, and well-wishers to explore our humanitarian initiatives across Healthcare, Education, Environment, and Poverty Relief.</p>
    `,
    coverImageUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    newsType: 'ANNOUNCEMENT',
    isPinned: true,
    status: 'PUBLISHED',
    publishedAt: '2026-10-15T09:00:00Z',
    authorName: 'Lion Prof. T. Sanjeewa Prasad Jayaweera (President)',
    authorId: 'usr-dev-001',
    createdAt: '2026-10-14T08:00:00Z',
    updatedAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'news-002',
    title: 'Upcoming Mega Eye Camp and Free Cataract Screening at Base Hospital Balangoda',
    slug: 'upcoming-mega-eye-camp-base-hospital-balangoda-2026',
    summary:
      'Registration opens for comprehensive vision screenings and fully sponsored cataract surgeries for underprivileged senior citizens.',
    content: `
      <p>Our flagship healthcare initiative returns this season with support from specialist ophthalmologists and volunteer medical officers.</p>
      <p>Free eye check-ups, diagnostic screenings, custom reading glasses distribution, and zero-cost cataract surgeries with high-grade intraocular lenses will be provided to eligible patients from rural areas.</p>
      <p>For pre-registration and transportation coordination, please contact the club secretariat or visit the Base Hospital registration desk.</p>
    `,
    coverImageUrl:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    newsType: 'NEWS',
    isPinned: false,
    status: 'PUBLISHED',
    publishedAt: '2026-10-10T14:30:00Z',
    authorName: 'Lion Dr. R.M. Senarathne (Project Chair)',
    authorId: 'usr-dev-001',
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-10T14:30:00Z',
  },
  {
    id: 'news-003',
    title: 'District 306 Awards Citation to Lions Club of Balangoda for Environmental Stewardship',
    slug: 'district-306-presidential-citation-environmental-stewardship',
    summary:
      'Recognizing over 1,200 native trees planted across the upper Walawe river basin to protect watershed reserves.',
    content: `
      <p>At the recent Lions District 306 Annual Cabinet Conference, the Lions Club of Balangoda received special recognition for outstanding environmental leadership.</p>
      <p>The citation highlights the collaborative watershed restoration campaign in Kaltota, which mobilized over 100 student volunteers and forest conservation officers.</p>
      <p>We extend our deepest gratitude to our partner schools, community elders, and dedicated club members who made this impact possible.</p>
    `,
    coverImageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    newsType: 'PRESS_RELEASE',
    isPinned: false,
    status: 'PUBLISHED',
    publishedAt: '2026-09-28T11:00:00Z',
    authorName: 'Lion H.M. Bandara (Secretary)',
    authorId: 'usr-dev-001',
    createdAt: '2026-09-27T15:00:00Z',
    updatedAt: '2026-09-28T11:00:00Z',
  },
  {
    id: 'news-004',
    title: 'Youth Leadership and School Stationery Distribution Drive Complete',
    slug: 'youth-leadership-stationery-distribution-complete',
    summary:
      'Over 250 students received educational packs, textbooks, and learning supplies for the new academic term.',
    content: `
      <p>Members of the Lions Club of Balangoda successfully concluded our annual educational supply drive across three rural primary schools in Medadumbara.</p>
      <p>Each recipient student was provided with school bags, exercise books, geometry kits, and essential stationery to support their uninterrupted schooling.</p>
    `,
    coverImageUrl:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    newsType: 'NEWS',
    isPinned: false,
    status: 'PUBLISHED',
    publishedAt: '2026-08-14T08:15:00Z',
    authorName: 'Lion H.M. Bandara (Secretary)',
    authorId: 'usr-dev-001',
    createdAt: '2026-08-13T12:00:00Z',
    updatedAt: '2026-08-14T08:15:00Z',
  },
  {
    id: 'news-draft-test',
    title: '[UNPUBLISHED DRAFT] Internal Cabinet Meeting Discussion Notes',
    slug: 'internal-cabinet-meeting-discussion-notes',
    summary: 'Internal committee working document - strictly confidential.',
    content: '<p>Internal draft content that must never be accessible on public endpoints.</p>',
    coverImageUrl: null,
    newsType: 'NEWS',
    isPinned: false,
    status: 'DRAFT',
    publishedAt: '2026-11-01T00:00:00Z',
    authorName: 'Club Secretary',
    authorId: 'usr-dev-001',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },
];
