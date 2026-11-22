/**
 * Type definitions for Homepage Content (LBW-31, FR-01)
 */

export interface ServicePillar {
  id: string;
  title: string;
  category: 'HEALTHCARE' | 'EDUCATION' | 'ENVIRONMENT' | 'RELIEF';
  icon: string;
  shortDescription: string;
  fullDescription: string;
  keyInitiatives: string[];
  impactHighlight: string;
}

export interface ClubMissionVision {
  motto: string;
  mission: string;
  vision: string;
  purpose: string;
}

export interface ClubHistory {
  charterDistrict: string;
  regionServed: string;
  establishedSummary: string;
  keyCommitments: string[];
}

export interface ImpactMetric {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  description: string;
  iconName: string;
}
