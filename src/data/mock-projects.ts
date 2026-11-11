import type { Project } from '../types/project.ts';

/**
 * Seed projects for the Lions Club of Balangoda Web Portal
 * Covers all 5 service pillars, multiple years, and status flags
 */
export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    title: 'Annual Free Cataract Surgery & Vision Screening Camp',
    slug: 'annual-free-cataract-surgery-vision-camp-2026',
    category: 'HEALTHCARE',
    summary:
      'Provided free eye examinations for 450 rural residents and funded 68 cataract surgeries at Balangoda Base Hospital.',
    description:
      '<p>In partnership with the District Health Directorate, our medical team screened elderly community members across 12 Grama Niladhari divisions. Beneficiaries received free corrective eyeglasses and post-operative medications.</p><p>Surgeries were performed by leading visiting ophthalmologists, restoring sight to vulnerable rural patients with zero financial burden to their families.</p>',
    coverImageUrl:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    eventDate: '2026-03-15',
    location: 'Balangoda Base Hospital',
    status: 'PUBLISHED',
    authorName: 'Lion Dr. R.M. Senarathne',
    createdAt: '2026-03-16T08:00:00Z',
    updatedAt: '2026-03-16T08:00:00Z',
    impactMetrics: [
      { label: 'Eye Screenings Conducted', value: 450, suffix: '+' },
      { label: 'Cataract Surgeries Funded', value: 68 },
      { label: 'Custom Eyeglasses Provided', value: 300, suffix: '+' },
    ],
    gallery: [
      {
        id: 'g-001',
        imageUrl:
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
        caption: 'Ophthalmic examination booth at Balangoda Base Hospital',
        displayOrder: 1,
      },
      {
        id: 'g-002',
        imageUrl:
          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
        caption: 'Volunteer ophthalmologists testing refractive errors and visual acuity',
        displayOrder: 2,
      },
      {
        id: 'g-003',
        imageUrl:
          'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
        caption: 'Distributing custom prescription spectacles to elderly beneficiaries',
        displayOrder: 3,
      },
    ],
  },
  {
    id: 'proj-002',
    title: 'School Supplies and Book Donation Drive for Rural Students',
    slug: 'school-supplies-book-donation-drive-2026',
    category: 'EDUCATION',
    summary:
      'Distributed essential stationery packs, textbooks, and backpacks to 280 underprivileged primary students in Medadumbara.',
    description:
      '<p>Aiming to mitigate educational disparity in rural tea estate communities, the project equipped young students with books, geometry sets, school shoes, and stationery for the academic year.</p><p>Club officers personally visited Medadumbara Maha Vidyalaya to deliver care packages and speak with teachers regarding continuing educational resources.</p>',
    coverImageUrl:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    eventDate: '2026-01-20',
    location: 'Medadumbara Maha Vidyalaya, Balangoda',
    status: 'PUBLISHED',
    authorName: 'Lion H.M. Bandara',
    createdAt: '2026-01-22T09:30:00Z',
    updatedAt: '2026-01-22T09:30:00Z',
    impactMetrics: [
      { label: 'Students Equipped', value: 280 },
      { label: 'Schools Supported', value: 3 },
      { label: 'Stationery Packs Delivered', value: 350, suffix: '+' },
    ],
    photos: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'proj-003',
    title: 'Green Balangoda: Watershed Reforestation Campaign',
    slug: 'green-balangoda-watershed-reforestation-2025',
    category: 'ENVIRONMENT',
    summary:
      'Planted 1,200 native tree saplings along the upper Walawe river catchment zone to prevent soil erosion and landslides.',
    description:
      '<p>Engaged Leo Club youth and local community volunteers to restore vital watershed vegetation, planting kumbuk, mee, and karanda saplings along vulnerable riverbanks in the Balangoda valley.</p>',
    coverImageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    eventDate: '2025-11-10',
    location: 'Upper Walawe Catchment Basin, Balangoda',
    status: 'PUBLISHED',
    authorName: 'Lion Prof. T. Sanjeewa Prasad Jayaweera',
    createdAt: '2025-11-12T10:00:00Z',
    updatedAt: '2025-11-12T10:00:00Z',
    impactMetrics: [
      { label: 'Native Trees Planted', value: 1200, suffix: '+' },
      { label: 'Riverbank Stabilized', value: '3.5', suffix: 'km' },
      { label: 'Active Volunteers', value: 45 },
    ],
    gallery: [
      {
        id: 'g-301',
        imageUrl:
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
        caption: 'Community tree planting along the Upper Walawe river catchment',
        displayOrder: 1,
      },
    ],
  },
  {
    id: 'proj-004',
    title: 'Emergency Flood Relief and Dry Ration Distribution',
    slug: 'emergency-flood-relief-dry-rations-2025',
    category: 'POVERTY_RELIEF',
    summary:
      'Supplied emergency dry rations, clean drinking water, and hygiene kits to 150 flood-affected families in Kaltota.',
    description:
      '<p>Rapid response relief effort following torrential monsoon rains in the Sabaragamuwa province. Lions volunteers mobilized essential food packages, baby nutrition packs, and water purification tablets.</p>',
    coverImageUrl:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    eventDate: '2025-06-18',
    location: 'Kaltota Community Center, Balangoda',
    status: 'PUBLISHED',
    authorName: 'Lion K.G. Wijeratne',
    createdAt: '2025-06-19T14:15:00Z',
    updatedAt: '2025-06-19T14:15:00Z',
    // Missing impactMetrics and gallery/photos intentionally: verifies AC-2!
  },
  {
    id: 'proj-005',
    title: 'Mobile Diabetes Awareness & Blood Screening Clinic',
    slug: 'mobile-diabetes-awareness-screening-clinic-2026',
    category: 'HEALTHCARE',
    summary:
      'Screened 320 plantation workers for blood glucose levels and conducted medical consultations on diabetes prevention.',
    description:
      '<p>Mobile health outreach initiative addressing the growing prevalence of chronic diabetes in estate sectors. Included HbA1c tests, lifestyle counseling, and referral slips for hospital follow-up.</p>',
    coverImageUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    eventDate: '2026-02-28',
    location: 'Nonpareil Tea Estate Community Hall',
    status: 'PUBLISHED',
    authorName: 'Lion Dr. R.M. Senarathne',
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
    impactMetrics: [
      { label: 'Plantation Workers Screened', value: 320 },
      { label: 'High-Risk Referrals', value: 42 },
    ],
    // Missing gallery/photos intentionally: verifies AC-2!
  },
  {
    id: 'proj-006',
    title: 'Upcoming Youth Vocational IT Skills Workshop (Internal Draft)',
    slug: 'youth-vocational-it-skills-workshop-draft',
    category: 'EDUCATION',
    summary:
      'Planned 4-week computer literacy and digital marketing program for school leavers in Balangoda.',
    description:
      'Draft proposal undergoing executive board approval. Curriculum includes basic office tools, web navigation, and graphic design fundamentals.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    eventDate: '2026-12-01',
    location: 'Balangoda Public Library Auditorium',
    status: 'DRAFT', // DRAFT record: MUST NOT appear on public portal! (verifies AC-3)
    createdAt: '2026-10-15T15:00:00Z',
    updatedAt: '2026-10-15T15:00:00Z',
  },
];
