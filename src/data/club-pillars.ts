import type {
  ServicePillar,
  ClubMissionVision,
  ClubHistory,
  ImpactMetric,
} from '../types/homepage';

/**
 * Verified Club Mission, Vision & Purpose (Proposal Section 1.2, 1.10)
 */
export const CLUB_MISSION_VISION: ClubMissionVision = {
  motto: 'We Serve',
  mission:
    'To empower volunteers to serve the community of Balangoda, meet humanitarian needs, encourage peace, and promote understanding through philanthropic programs.',
  vision:
    'To be the recognized leader in community and humanitarian service across the Balangoda and Sabaragamuwa region, fostering a thriving society where dignity and care reach every citizen.',
  purpose:
    'Dedicated to uplifting underprivileged communities across rural Balangoda through sustainable health camps, literacy programs, ecological restoration, and emergency assistance.',
};

/**
 * Four Core Humanitarian Service Pillars (Proposal Section 1.2, 2.2, FR-01)
 */
export const SERVICE_PILLARS: readonly ServicePillar[] = [
  {
    id: 'pillar-healthcare',
    title: 'Vision Care & Healthcare',
    category: 'HEALTHCARE',
    icon: 'Eye',
    shortDescription:
      'Eliminating preventable blindness and delivering essential health services to rural communities.',
    fullDescription:
      'We organize comprehensive community eye camps, provide free custom eyeglasses, sponsor cataract replacement surgeries, and conduct diabetes and non-communicable disease screenings across Balangoda.',
    keyInitiatives: [
      'Free Mobile Vision Screening Camps',
      'Cataract Surgery Sponsorships with Base Hospitals',
      'Pediatric Eye Health & Eyeglass Distribution',
      'Diabetes Awareness & Blood Donation Drives',
    ],
    impactHighlight:
      'Over 3,500 vision screenings and 300+ custom spectacles distributed annually.',
  },
  {
    id: 'pillar-education',
    title: 'Youth Education & Literacy',
    category: 'EDUCATION',
    icon: 'GraduationCap',
    shortDescription:
      'Investing in the next generation by providing educational resources, scholarships, and learning tools.',
    fullDescription:
      'Education is the foundation of community transformation. Our club provides annual educational assistance packages, builds school libraries in rural plantations, and mentors disadvantaged youth.',
    keyInitiatives: [
      'Annual Book & Stationery Distribution Drives',
      'Merit-Based Scholarships for Rural High Schoolers',
      'School Infrastructure & Science Lab Upgrades',
      'IT Literacy Workshops with University Students',
    ],
    impactHighlight: 'Supported 1,200+ rural schoolchildren with annual learning materials.',
  },
  {
    id: 'pillar-environment',
    title: 'Environmental Stewardship',
    category: 'ENVIRONMENT',
    icon: 'Trees',
    shortDescription:
      'Protecting the natural heritage of the Sabaragamuwa province through reforestation and conservation.',
    fullDescription:
      'Balangoda is blessed with rich biodiversity that demands active preservation. We lead native tree planting campaigns, protect river catchment basins, and conduct community waste management drives.',
    keyInitiatives: [
      'Native Catchment Reforestation in Balangoda Hills',
      'Clean Water Access in Agricultural Hamlets',
      'Plastic Waste Audits & School Eco-Clubs',
      'Organic Home Gardening & Food Security Programs',
    ],
    impactHighlight: 'More than 2,000 native trees planted across watershed protection zones.',
  },
  {
    id: 'pillar-relief',
    title: 'Hunger & Poverty Relief',
    category: 'RELIEF',
    icon: 'HeartHandshake',
    shortDescription:
      'Standing with vulnerable families during times of hardship, seasonal famine, and natural disasters.',
    fullDescription:
      'Whenever crisis strikes or families face chronic food insecurity, our Lions volunteers are on the ground delivering dry ration food packs, emergency disaster relief kits, and livelihood assistance.',
    keyInitiatives: [
      'Emergency Flood & Landslide Relief Operations',
      'Monthly Dry Food Distribution for Elders and Widows',
      'Self-Employment Livelihood Seed Grants',
      'Safe Drinking Water Tanks for Mountain Villages',
    ],
    impactHighlight: 'Over 15,000 community members assisted through grassroots relief operations.',
  },
] as const;

/**
 * Verified Club Charter History Summary (Proposal Section 1.2, 1.10)
 */
export const CLUB_HISTORY: ClubHistory = {
  charterDistrict: 'Lions Clubs International District 306, Sri Lanka',
  regionServed: 'Balangoda, Imbulpe, Weligepola, and surrounding Sabaragamuwa foothills',
  establishedSummary:
    'Chartered under Lions Clubs International District 306, the Lions Club of Balangoda brings together committed community leaders, professionals, and volunteers united by one timeless motto: "We Serve". For years, the club has operated as a pillar of compassionate civic leadership in Balangoda, addressing humanitarian challenges where public resources fall short.',
  keyCommitments: [
    '100% Volunteer Driven: Zero administrative overhead on donated funds.',
    'Verified Local Need: Every initiative is vetted directly with regional healthcare and educational authorities.',
    'Non-Partisan Humanitarian Service: Serving all community members with equality, dignity, and transparency.',
    'Transparent Stewardship: Regular public reporting and audited financial records.',
  ],
};

/**
 * Verified Impact Metrics (Proposal Section 1.13, 3.2, Database Seeds)
 */
export const IMPACT_METRICS: readonly ImpactMetric[] = [
  {
    key: 'BENEFICIARIES_SERVED',
    label: 'Lives Impacted',
    value: 15000,
    formattedValue: '>15,000+',
    description: 'Community members assisted across rural health, education, and relief camps.',
    iconName: 'Users',
  },
  {
    key: 'VISION_SCREENINGS',
    label: 'Free Vision Screenings',
    value: 3500,
    formattedValue: '3,500+',
    description: 'Children, elders, and plantation workers tested with free eyeglasses provided.',
    iconName: 'Eye',
  },
  {
    key: 'TREES_PLANTED',
    label: 'Native Trees Planted',
    value: 2000,
    formattedValue: '2,000+',
    description: 'Planted across catchment basins in the Balangoda and Sabaragamuwa hills.',
    iconName: 'TreePine',
  },
  {
    key: 'PROJECTS_COMPLETED',
    label: 'Community Projects',
    value: 120,
    formattedValue: '120+',
    description: 'Dedicated humanitarian initiatives successfully planned and executed.',
    iconName: 'HeartHandshake',
  },
] as const;
